import {
  evaluateAllCategories,
  evaluateCategoryCriteria,
} from "@/lib/category-calculator";
import { RETENTION_VALUE } from "@/lib/config";
import { calculateInstructorPaymentData } from "@/lib/payment-calculator";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../lib/db";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const paymentsRouter = router({
  // Get all payments (public)
  getAll: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(1000).default(20),
          offset: z.number().min(0).default(0),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const limit = input?.limit ?? 20;
      const offset = input?.offset ?? 0;

      const [payments, total] = await Promise.all([
        prisma.instructorPayment.findMany({
          include: {
            instructor: {
              select: {
                id: true,
                name: true,
                fullName: true,
              },
            },
            period: {
              select: {
                id: true,
                number: true,
                year: true,
              },
            },
          },
          orderBy: [
            { period: { number: "desc" } },
            { period: { year: "desc" } },
            { createdAt: "desc" },
            { id: "desc" },
          ],
          take: limit,
          skip: offset,
        }),
        prisma.instructorPayment.count(),
      ]);

      return {
        payments,
        total,
        hasMore: offset + limit < total,
      };
    }),

  // Get payment by ID (public)
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const payment = await prisma.instructorPayment.findUnique({
        where: {
          id: input.id,
        },
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              fullName: true,
              phone: true,
              DNI: true,
            },
          },
          period: {
            select: {
              id: true,
              number: true,
              year: true,
              startDate: true,
              endDate: true,
            },
          },
        },
      });

      return payment;
    }),

  // Get payments with filters (protected)
  getWithFilters: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        instructorId: z.string().optional(),
        periodId: z.string().optional(),
        periodStart: z.string().optional(),
        periodEnd: z.string().optional(),
        status: z.enum(["PENDING", "APPROVED", "PAID", "CANCELLED"]).optional(),
        disciplineId: z.string().optional(),
        week: z.number().optional(),
        studio: z.string().optional(),
        classId: z.string().optional(),
        active: z.boolean().optional(),
        limit: z.number().min(1).max(1000).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const where: {
        tenantId?: string;
        OR?: Array<{
          instructor?: {
            name?: { contains: string; mode: "insensitive" };
            fullName?: { contains: string; mode: "insensitive" };
            phone?: { contains: string; mode: "insensitive" };
            DNI?: { contains: string; mode: "insensitive" };
          };
          comments?: { contains: string; mode: "insensitive" };
        }>;
        instructorId?: string;
        periodId?: string;
        status?: string;
        meetsGuidelines?: boolean;
        eventParticipation?: boolean;
        createdAt?: { gte?: Date; lte?: Date };
      } = {
        tenantId: ctx.user?.tenantId || ctx.instructor?.tenantId || undefined,
      };

      if (input.search) {
        where.OR = [
          {
            instructor: {
              name: { contains: input.search, mode: "insensitive" },
            },
          },
          {
            instructor: {
              fullName: { contains: input.search, mode: "insensitive" },
            },
          },
          {
            instructor: {
              phone: { contains: input.search, mode: "insensitive" },
            },
          },
          {
            instructor: {
              DNI: { contains: input.search, mode: "insensitive" },
            },
          },
        ];
      }

      if (input.instructorId) {
        where.instructorId = input.instructorId;
      }

      // Handle period filtering
      if (input.periodId) {
        where.periodId = input.periodId;
      }
      // Note: Period range filtering would require a different approach
      // since periodId is a string field, not numeric

      if (input.status) {
        where.status = input.status;
      }

      // Note: Class-based filtering is not directly supported on instructor payments
      // These filters would need to be implemented differently or removed

      // Note: instructorPayment doesn't have an 'active' field, removing this filter

      const [payments, total] = await Promise.all([
        prisma.instructorPayment.findMany({
          where,
          include: {
            instructor: {
              select: {
                id: true,
                name: true,
                fullName: true,
                phone: true,
                DNI: true,
              },
            },
            period: {
              select: {
                id: true,
                number: true,
                year: true,
              },
            },
          },
          orderBy: [
            { period: { number: "desc" } },
            { period: { year: "desc" } },
            { createdAt: "desc" },
            { id: "desc" },
          ],
          take: input.limit,
          skip: input.offset,
        }),
        prisma.instructorPayment.count({ where }),
      ]);

      return {
        payments,
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  // Create payment (protected)
  create: protectedProcedure
    .input(
      z.object({
        amount: z.number().min(0),
        instructorId: z.string(),
        periodId: z.string(),
        status: z
          .enum(["PENDING", "APPROVED", "PAID", "CANCELLED"])
          .default("PENDING"),
        retention: z.number().default(0),
        adjustment: z.number().default(0),
        penalty: z.number().default(0),
        cover: z.number().default(0),
        branding: z.number().default(0),
        themeRide: z.number().default(0),
        workshop: z.number().default(0),
        versusBonus: z.number().default(0),
        bonus: z.number().default(0),
        adjustmentType: z.enum(["FIXED", "PERCENTAGE"]).default("FIXED"),
        details: z.record(z.unknown()).optional(),
        comments: z.string().optional(),
        finalPayment: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      // Verify instructor exists
      const instructor = await prisma.instructor.findUnique({
        where: { id: input.instructorId },
      });
      if (!instructor) {
        throw new Error("Instructor not found");
      }

      // Verify period exists
      const period = await prisma.period.findUnique({
        where: { id: input.periodId },
      });
      if (!period) {
        throw new Error("Period not found");
      }

      // Calculate final payment
      let finalPayment = input.amount;

      // Add adjustment if exists
      if (input.adjustment) {
        finalPayment +=
          input.adjustmentType === "PERCENTAGE"
            ? (input.amount * input.adjustment) / 100
            : input.adjustment;
      }

      // Add bonuses
      finalPayment += input.bonus || 0;
      finalPayment += input.cover || 0;
      finalPayment += input.branding || 0;
      finalPayment += input.themeRide || 0;
      finalPayment += input.workshop || 0;
      finalPayment += input.versusBonus || 0;

      // Subtract penalties
      finalPayment -= input.penalty || 0;

      // Subtract retention
      finalPayment -= input.retention;

      const payment = await prisma.instructorPayment.create({
        data: {
          amount: input.amount,
          status: input.status,
          instructorId: input.instructorId,
          periodId: input.periodId,
          retention: input.retention,
          adjustment: input.adjustment,
          penalty: input.penalty,
          cover: input.cover,
          branding: input.branding,
          themeRide: input.themeRide,
          workshop: input.workshop,
          versusBonus: input.versusBonus,
          bonus: input.bonus,
          adjustmentType: input.adjustmentType,
          details: input.details
            ? JSON.parse(JSON.stringify(input.details))
            : null,
          comments: input.comments,
          finalPayment: input.finalPayment || finalPayment,
          tenantId: ctx.user.tenantId,
        },
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              fullName: true,
            },
          },
          period: {
            select: {
              id: true,
              number: true,
              year: true,
            },
          },
        },
      });

      return payment;
    }),

  // Update payment (protected)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        amount: z.number().optional(),
        status: z.enum(["PENDING", "APPROVED", "PAID", "CANCELLED"]).optional(),
        retention: z.number().optional(),
        adjustment: z.number().optional(),
        penalty: z.number().optional(),
        cover: z.number().optional(),
        branding: z.number().optional(),
        themeRide: z.number().optional(),
        workshop: z.number().optional(),
        versusBonus: z.number().optional(),
        bonus: z.number().optional(),
        adjustmentType: z.enum(["FIXED", "PERCENTAGE"]).optional(),
        details: z.record(z.unknown()).optional(),
        comments: z.string().optional(),
        finalPayment: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      const { id, details, ...restData } = input;

      // Serialize details if present
      type UpdateData = {
        amount?: number;
        status?: "PENDING" | "APPROVED" | "PAID" | "CANCELLED";
        retention?: number;
        adjustment?: number;
        penalty?: number;
        cover?: number;
        branding?: number;
        themeRide?: number;
        workshop?: number;
        versusBonus?: number;
        bonus?: number | null;
        adjustmentType?: "FIXED" | "PERCENTAGE";
        details?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
        comments?: string;
        finalPayment?: number;
      };

      const updateData: UpdateData = {
        ...restData,
        ...(details !== undefined && {
          details: details
            ? (JSON.parse(JSON.stringify(details)) as Prisma.InputJsonValue)
            : Prisma.JsonNull,
        }),
      };

      // Recalculate final payment if amount or adjustments change
      const needsRecalculation =
        updateData.amount !== undefined ||
        updateData.retention !== undefined ||
        updateData.adjustment !== undefined ||
        updateData.adjustmentType !== undefined ||
        updateData.bonus !== undefined ||
        updateData.cover !== undefined ||
        updateData.branding !== undefined ||
        updateData.themeRide !== undefined ||
        updateData.workshop !== undefined ||
        updateData.versusBonus !== undefined ||
        updateData.penalty !== undefined;

      if (needsRecalculation) {
        const currentPayment = await prisma.instructorPayment.findUnique({
          where: { id },
          select: {
            amount: true,
            retention: true,
            adjustment: true,
            adjustmentType: true,
            bonus: true,
            cover: true,
            branding: true,
            themeRide: true,
            workshop: true,
            versusBonus: true,
            penalty: true,
          },
        });

        if (currentPayment) {
          const amount = updateData.amount ?? currentPayment.amount;
          const _retention = updateData.retention ?? currentPayment.retention;
          const adjustment = updateData.adjustment ?? currentPayment.adjustment;
          const adjustmentType =
            updateData.adjustmentType ?? currentPayment.adjustmentType;
          const bonus = updateData.bonus ?? currentPayment.bonus ?? 0;
          const cover = updateData.cover ?? currentPayment.cover;
          const branding = updateData.branding ?? currentPayment.branding;
          const themeRide = updateData.themeRide ?? currentPayment.themeRide;
          const workshop = updateData.workshop ?? currentPayment.workshop;
          const versusBonus =
            updateData.versusBonus ?? currentPayment.versusBonus;
          const penalty = updateData.penalty ?? currentPayment.penalty;

          // Calculate adjustment amount
          const adjustmentAmount =
            adjustmentType === "PERCENTAGE"
              ? (amount * adjustment) / 100
              : adjustment;

          // Subtotal before retention: base + bonuses - penalties + adjustment
          const subtotalBeforeRetention =
            amount +
            bonus +
            cover +
            branding +
            themeRide +
            workshop +
            versusBonus -
            penalty +
            adjustmentAmount;

          // Recalculate retention based on the subtotal (after including adjustment)
          const newRetention = subtotalBeforeRetention * RETENTION_VALUE;

          // Final payment = subtotal - retention
          const finalPayment = subtotalBeforeRetention - newRetention;

          // Write recalculated values
          updateData.retention = newRetention;
          updateData.finalPayment = finalPayment;
        }
      }

      const payment = await prisma.instructorPayment.update({
        where: {
          id,
          tenantId: ctx.user.tenantId,
        },
        data: updateData,
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              fullName: true,
            },
          },
          period: {
            select: {
              id: true,
              number: true,
              year: true,
            },
          },
        },
      });

      return payment;
    }),

  // Delete payment (protected)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      await prisma.instructorPayment.delete({
        where: {
          id: input.id,
          tenantId: ctx.user.tenantId,
        },
      });

      return { success: true };
    }),

  // Get payment statistics (protected)
  getStats: protectedProcedure
    .input(z.object({ paymentId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      const payment = await prisma.instructorPayment.findUnique({
        where: {
          id: input.paymentId,
          tenantId: ctx.user.tenantId,
        },
        select: {
          id: true,
          amount: true,
          finalPayment: true,
          status: true,
          retention: true,
          adjustment: true,
          penalty: true,
          cover: true,
          branding: true,
          themeRide: true,
          workshop: true,
          versusBonus: true,
          bonus: true,
          instructor: {
            select: {
              name: true,
              fullName: true,
            },
          },
          period: {
            select: {
              number: true,
              year: true,
            },
          },
        },
      });

      if (!payment) {
        throw new Error("Payment not found");
      }

      const totalDeductions = payment.retention + payment.penalty;
      const totalBonuses =
        payment.adjustment +
        payment.cover +
        payment.branding +
        payment.themeRide +
        payment.workshop +
        payment.versusBonus +
        (payment.bonus || 0);

      return {
        payment,
        stats: {
          totalDeductions,
          totalBonuses,
          netAmount: payment.finalPayment,
          grossAmount: payment.amount,
          deductionRate:
            payment.amount > 0 ? (totalDeductions / payment.amount) * 100 : 0,
          bonusRate:
            payment.amount > 0 ? (totalBonuses / payment.amount) * 100 : 0,
        },
      };
    }),

  // Calculate payment for a single instructor (protected)
  calculateInstructorPayment: protectedProcedure
    .input(
      z.object({
        instructorId: z.string(),
        periodId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      const logs: string[] = [];

      try {
        logs.push(
          `🚀 Iniciando cálculo para instructor ID: ${input.instructorId}, Período ID: ${input.periodId}`
        );

        // Check existing payment
        const existingPayment = await prisma.instructorPayment.findUnique({
          where: {
            instructorId_periodId_tenantId: {
              instructorId: input.instructorId,
              periodId: input.periodId,
              tenantId: ctx.user.tenantId,
            },
          },
        });

        if (existingPayment) {
          logs.push(
            `📋 Pago existente encontrado: ID ${existingPayment.id}, Estado: ${existingPayment.status}`
          );

          // If payment is approved or paid or cancelled, don't touch it
          if (
            existingPayment.status === "APPROVED" ||
            existingPayment.status === "PAID"
          ) {
            logs.push("✅ Pago ya está aprobado, no se modificará");
            return {
              success: true,
              message: "Pago ya está aprobado, no se modificó",
              paymentId: existingPayment.id,
              logs,
            };
          }

          if (existingPayment.status === "CANCELLED") {
            logs.push("⛔ Pago cancelado, no se recalcula");
            return {
              success: true,
              message: "Pago cancelado - no se recalculó",
              paymentId: existingPayment.id,
              logs,
            };
          }

          // Preserve reajuste and comments
          const preservedAdjustment = existingPayment.adjustment || 0;
          const preservedAdjustmentType =
            existingPayment.adjustmentType || "FIXED";
          const preservedComments = existingPayment.comments || undefined;

          // Delete old payment to recreate with new calculation
          await prisma.instructorPayment.delete({
            where: { id: existingPayment.id },
          });
          logs.push(
            "🗑️ Pago previo eliminado para recalcular (reajuste y comentarios preservados)"
          );

          // Calculate payment data
          const calculationData = await calculateInstructorPaymentData(
            input.instructorId,
            input.periodId,
            ctx.user.tenantId,
            logs
          );

          // Recompute retention including preserved adjustment
          const baseSubtotal =
            calculationData.baseAmount +
            calculationData.bonuses.total -
            calculationData.penalties;
          const adjustmentAmount =
            preservedAdjustmentType === "PERCENTAGE"
              ? (calculationData.baseAmount * preservedAdjustment) / 100
              : preservedAdjustment;
          const subtotalBeforeRetention = baseSubtotal + adjustmentAmount;
          const recalculatedRetention =
            subtotalBeforeRetention * RETENTION_VALUE;
          const recalculatedFinal =
            subtotalBeforeRetention - recalculatedRetention;

          const payment = await prisma.instructorPayment.create({
            data: {
              amount: calculationData.baseAmount,
              status: "PENDING",
              instructorId: input.instructorId,
              periodId: input.periodId,
              tenantId: ctx.user.tenantId,
              details: JSON.parse(
                JSON.stringify({
                  classCalculations: calculationData.classCalculations,
                  bonuses: calculationData.bonuses,
                  penalties: calculationData.penalties,
                  retention: recalculatedRetention,
                })
              ),
              meetsGuidelines: true,
              doubleShifts: 0,
              nonPrimeHours: 0,
              eventParticipation: true,
              retention: recalculatedRetention,
              adjustment: preservedAdjustment,
              adjustmentType: preservedAdjustmentType,
              penalty: calculationData.penalties,
              cover: calculationData.bonuses.cover,
              branding: calculationData.bonuses.branding,
              themeRide: calculationData.bonuses.themeRide,
              workshop: calculationData.bonuses.workshop,
              versusBonus: calculationData.bonuses.versus,
              bonus: calculationData.bonuses.total,
              finalPayment: recalculatedFinal,
              comments: preservedComments,
            },
          });
          logs.push(`✅ Nuevo pago creado: ID ${payment.id}`);

          return {
            success: true,
            message: "Pago recalculado exitosamente",
            paymentId: payment.id,
            logs,
          };
        }
        logs.push(
          "📋 No se encontró pago existente para este instructor y período"
        );

        // Calculate payment data (no previous payment)
        const calculationData = await calculateInstructorPaymentData(
          input.instructorId,
          input.periodId,
          ctx.user.tenantId,
          logs
        );

        const baseSubtotal =
          calculationData.baseAmount +
          calculationData.bonuses.total -
          calculationData.penalties;
        const recalculatedRetention = baseSubtotal * RETENTION_VALUE;
        const recalculatedFinal = baseSubtotal - recalculatedRetention;

        const payment = await prisma.instructorPayment.create({
          data: {
            amount: calculationData.baseAmount,
            status: "PENDING",
            instructorId: input.instructorId,
            periodId: input.periodId,
            tenantId: ctx.user.tenantId,
            details: JSON.parse(
              JSON.stringify({
                classCalculations: calculationData.classCalculations,
                bonuses: calculationData.bonuses,
                penalties: calculationData.penalties,
                retention: recalculatedRetention,
              })
            ),
            meetsGuidelines: true,
            doubleShifts: 0,
            nonPrimeHours: 0,
            eventParticipation: true,
            retention: recalculatedRetention,
            adjustment: 0,
            adjustmentType: "FIXED",
            penalty: calculationData.penalties,
            cover: calculationData.bonuses.cover,
            branding: calculationData.bonuses.branding,
            themeRide: calculationData.bonuses.themeRide,
            workshop: calculationData.bonuses.workshop,
            versusBonus: calculationData.bonuses.versus,
            bonus: calculationData.bonuses.total,
            finalPayment: recalculatedFinal,
            comments: `Cálculo automático - ${new Date().toLocaleString()}`,
          },
        });
        logs.push(`✅ Nuevo pago creado: ID ${payment.id}`);

        return {
          success: true,
          message: "Pago calculado exitosamente",
          paymentId: payment.id,
          logs,
        };
      } catch (error) {
        logs.push(
          `❌ Error en cálculo: ${error instanceof Error ? error.message : "Error desconocido"}`
        );
        return {
          success: false,
          message: "Error al calcular el pago",
          logs,
          error: error instanceof Error ? error.message : "Error desconocido",
        };
      }
    }),

  // Calculate all payments for a period (protected)
  calculateAllPeriodPayments: protectedProcedure
    .input(
      z.object({
        periodId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      const instructorLogs: Array<{
        instructorId: string;
        instructorName: string;
        status: "success" | "error" | "skipped";
        message: string;
        details: {
          categories: Array<{
            disciplineId: string;
            disciplineName: string;
            category: string;
            metrics: Record<string, unknown>;
            reason: string;
            allCategoriesEvaluation: Array<{
              category: string;
              categoryLabel: string;
              criteria: Array<{
                key: string;
                label: string;
                current: string;
                required: string;
                meets: boolean;
              }>;
              allMeets: boolean;
            }>;
          }>;
          classes: Array<{
            classId: string;
            disciplineName: string;
            date: string;
            studio: string;
            hour: string;
            spots: number;
            reservations: number;
            occupancy: number;
            category: string;
            baseAmount: number;
            finalAmount: number;
            calculation: string;
          }>;
          bonuses: {
            cover: number;
            branding: number;
            themeRide: number;
            workshop: number;
            versus: number;
            total: number;
          };
          penalties: number;
          retention: number;
          totalAmount: number;
          finalPayment: number;
        };
        error?: string;
      }> = [];

      try {
        // Get all active instructors
        const instructors = await prisma.instructor.findMany({
          where: {
            active: true,
            tenantId: ctx.user.tenantId,
          },
          include: {
            classes: {
              where: { periodId: input.periodId },
              include: { discipline: true },
            },
            categories: {
              where: { periodId: input.periodId },
              include: { discipline: true },
            },
          },
        });

        // Fetch existing payments to preserve adjustments/comments when needed
        const existingPayments = await prisma.instructorPayment.findMany({
          where: {
            periodId: input.periodId,
            tenantId: ctx.user.tenantId,
          },
        });

        let successCount = 0;
        let errorCount = 0;
        let skippedCount = 0;

        // Calculate payment for each instructor
        for (const instructor of instructors) {
          const instructorLog: (typeof instructorLogs)[0] = {
            instructorId: instructor.id,
            instructorName: instructor.name,
            status: "success",
            message: "",
            details: {
              categories: [],
              classes: [],
              bonuses: {
                cover: 0,
                branding: 0,
                themeRide: 0,
                workshop: 0,
                versus: 0,
                total: 0,
              },
              penalties: 0,
              retention: 0,
              totalAmount: 0,
              finalPayment: 0,
            },
          };

          if (instructor.classes.length === 0) {
            instructorLog.status = "skipped";
            instructorLog.message = "No tiene clases en este período";
            instructorLogs.push(instructorLog);
            skippedCount++;
            continue;
          }

          // Check if instructor already has an approved/paid/cancelled payment
          const existingApprovedPayment =
            await prisma.instructorPayment.findFirst({
              where: {
                instructorId: instructor.id,
                periodId: input.periodId,
                status: { in: ["APPROVED", "PAID", "CANCELLED"] },
                tenantId: ctx.user.tenantId,
              },
            });

          if (existingApprovedPayment) {
            instructorLog.status = "skipped";
            instructorLog.message =
              existingApprovedPayment.status === "CANCELLED"
                ? "Pago cancelado (se mantiene en 0)"
                : "Ya tiene pago aprobado/pagado";
            instructorLogs.push(instructorLog);
            skippedCount++;
            continue;
          }

          try {
            const result = await calculateInstructorPaymentData(
              instructor.id,
              input.periodId,
              ctx.user.tenantId,
              []
            );

            // Process categories
            for (const category of instructor.categories || []) {
              // Get formula to evaluate criteria
              const formula = await prisma.formula.findUnique({
                where: {
                  disciplineId_periodId_tenantId: {
                    disciplineId: category.disciplineId,
                    periodId: input.periodId,
                    tenantId: ctx.user.tenantId,
                  },
                },
              });

              let allCategoriesEvaluation: Array<{
                category: string;
                categoryLabel: string;
                criteria: Array<{
                  key: string;
                  label: string;
                  current: string;
                  required: string;
                  meets: boolean;
                }>;
                allMeets: boolean;
              }> = [];

              if (formula && !category.isManual) {
                const categoryReq =
                  formula.categoryRequirements as unknown as Record<
                    string,
                    import("@/lib/category-calculator").CategoryRequirements
                  >;
                const metrics = (category.metrics ?? {}) as unknown as import(
                  "@/lib/category-calculator"
                ).DisciplineMetrics;

                const allEval = evaluateAllCategories(categoryReq, metrics);

                allCategoriesEvaluation = allEval.map((e) => ({
                  category: e.category,
                  categoryLabel: e.categoryLabel,
                  criteria: e.criteria.map((c) => ({
                    key: c.key,
                    label: c.label,
                    current: String(c.current),
                    required: String(c.required),
                    meets: c.meets,
                  })),
                  allMeets: e.allMeets,
                }));
              }

              instructorLog.details.categories.push({
                disciplineId: category.disciplineId,
                disciplineName: category.discipline?.name || "Desconocida",
                category: category.category,
                metrics: (category.metrics as Record<string, unknown>) || {},
                reason: category.isManual
                  ? "Asignación manual"
                  : "Cálculo automático basado en métricas",
                allCategoriesEvaluation,
              });
            }

            // Process classes
            for (const classCalc of result.classCalculations) {
              instructorLog.details.classes.push({
                classId: classCalc.classId,
                disciplineName: classCalc.disciplineName,
                date: classCalc.classDate.toISOString(),
                studio: classCalc.studio,
                hour: classCalc.hour,
                spots: classCalc.spots,
                reservations: classCalc.totalReservations,
                occupancy: classCalc.occupancy,
                category: classCalc.category,
                baseAmount: classCalc.calculatedAmount,
                finalAmount: classCalc.calculatedAmount,
                calculation: `${classCalc.category} - ${classCalc.calculationDetail}`,
              });
            }

            // Process bonuses and penalties
            instructorLog.details.bonuses = result.bonuses;
            instructorLog.details.penalties = result.penalties;
            instructorLog.details.retention = result.retention;
            instructorLog.details.totalAmount = result.baseAmount;
            instructorLog.details.finalPayment = result.finalPayment;

            // Preserve previous pending payment data if exists
            const previous = existingPayments.find(
              (p) =>
                p.instructorId === instructor.id &&
                p.periodId === input.periodId &&
                p.status === "PENDING"
            );

            const preservedAdjustment = previous?.adjustment ?? 0;
            const preservedAdjustmentType = previous?.adjustmentType ?? "FIXED";
            const preservedComments = previous?.comments ?? undefined;

            if (previous) {
              await prisma.instructorPayment.delete({
                where: { id: previous.id },
              });
            }

            // Recalculate retention including preserved adjustment
            const baseSubtotal =
              result.baseAmount + result.bonuses.total - result.penalties;
            const adjustmentAmount =
              preservedAdjustmentType === "PERCENTAGE"
                ? (result.baseAmount * preservedAdjustment) / 100
                : preservedAdjustment;
            const subtotalBeforeRetention = baseSubtotal + adjustmentAmount;
            const recalculatedRetention =
              subtotalBeforeRetention * RETENTION_VALUE;
            const recalculatedFinal =
              subtotalBeforeRetention - recalculatedRetention;

            // Create payment
            await prisma.instructorPayment.create({
              data: {
                amount: result.baseAmount,
                status: "PENDING",
                instructorId: instructor.id,
                periodId: input.periodId,
                tenantId: ctx.user.tenantId,
                details: JSON.parse(
                  JSON.stringify({
                    classCalculations: result.classCalculations,
                    bonuses: result.bonuses,
                    penalties: result.penalties,
                    retention: recalculatedRetention,
                  })
                ),
                meetsGuidelines: true,
                doubleShifts: 0,
                nonPrimeHours: 0,
                eventParticipation: true,
                retention: recalculatedRetention,
                adjustment: preservedAdjustment,
                adjustmentType: preservedAdjustmentType,
                penalty: result.penalties,
                cover: result.bonuses.cover,
                branding: result.bonuses.branding,
                themeRide: result.bonuses.themeRide,
                workshop: result.bonuses.workshop,
                versusBonus: result.bonuses.versus,
                bonus: result.bonuses.total,
                finalPayment: recalculatedFinal,
                comments:
                  preservedComments ??
                  `Cálculo automático - ${new Date().toLocaleString()}`,
              },
            });

            instructorLog.status = "success";
            instructorLog.message = `Pago calculado exitosamente: S/ ${recalculatedFinal.toFixed(2)}`;
            instructorLogs.push(instructorLog);
            successCount++;
          } catch (error) {
            instructorLog.status = "error";
            instructorLog.message = "Error al calcular pago";
            instructorLog.error =
              error instanceof Error ? error.message : "Error desconocido";
            instructorLogs.push(instructorLog);
            errorCount++;
          }
        }

        return {
          success: true,
          message: `Cálculo completado: ${successCount} exitosos, ${errorCount} errores, ${skippedCount} omitidos`,
          instructorLogs,
          summary: {
            total: instructors.length,
            success: successCount,
            errors: errorCount,
            skipped: skippedCount,
            deletedPayments: 0,
          },
        };
      } catch (error) {
        return {
          success: false,
          message: "Error al calcular los pagos",
          instructorLogs: [],
          error: error instanceof Error ? error.message : "Error desconocido",
        };
      }
    }),

  // Toggle payment status (protected)
  toggleStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["PENDING", "APPROVED", "PAID", "CANCELLED"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      // Verify payment exists and belongs to tenant
      const existingPayment = await prisma.instructorPayment.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!existingPayment) {
        throw new Error("Payment not found");
      }

      if (existingPayment.tenantId !== ctx.user.tenantId) {
        throw new Error("Unauthorized");
      }

      // Update payment status (if cancelling, zero out amounts)
      const data: Prisma.InstructorPaymentUpdateInput =
        input.status === "CANCELLED"
          ? {
              status: input.status,
              amount: 0,
              retention: 0,
              adjustment: 0,
              bonus: 0,
              cover: 0,
              branding: 0,
              themeRide: 0,
              workshop: 0,
              versusBonus: 0,
              penalty: 0,
              finalPayment: 0,
            }
          : { status: input.status };

      const updatedPayment = await prisma.instructorPayment.update({
        where: {
          id: input.id,
        },
        data,
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              fullName: true,
            },
          },
          period: {
            select: {
              id: true,
              number: true,
              year: true,
            },
          },
        },
      });

      return updatedPayment;
    }),
});
