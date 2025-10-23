import { z } from "zod";
import { prisma } from "../../lib/db";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const paymentsRouter = router({
  // Get all payments (public)
  getAll: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(20),
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
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
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
        limit: z.number().min(1).max(100).default(20),
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
        tenantId: ctx.user?.tenantId || undefined,
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
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
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
        details: z.any().optional(),
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
      let finalPayment = input.amount - input.retention;
      if (input.adjustment) {
        finalPayment +=
          input.adjustmentType === "PERCENTAGE"
            ? (input.amount * input.adjustment) / 100
            : input.adjustment;
      }

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
          details: input.details,
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
        details: z.any().optional(),
        comments: z.string().optional(),
        finalPayment: z.number().optional(),
        active: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      const { id, ...updateData } = input;

      // Recalculate final payment if amount or adjustments change
      if (
        updateData.amount !== undefined ||
        updateData.retention !== undefined ||
        updateData.adjustment !== undefined ||
        updateData.adjustmentType !== undefined
      ) {
        const currentPayment = await prisma.instructorPayment.findUnique({
          where: { id },
          select: {
            amount: true,
            retention: true,
            adjustment: true,
            adjustmentType: true,
          },
        });

        if (currentPayment) {
          const amount = updateData.amount ?? currentPayment.amount;
          const retention = updateData.retention ?? currentPayment.retention;
          const adjustment = updateData.adjustment ?? currentPayment.adjustment;
          const adjustmentType =
            updateData.adjustmentType ?? currentPayment.adjustmentType;

          let finalPayment = amount - retention;
          if (adjustment) {
            finalPayment +=
              adjustmentType === "PERCENTAGE"
                ? (amount * adjustment) / 100
                : adjustment;
          }

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

  // Calculate payments for period (protected)
  calculateForPeriod: protectedProcedure
    .input(z.object({ periodId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      // This would typically involve complex calculation logic
      // For now, we'll return a placeholder response
      return {
        message: "Payment calculation initiated",
        periodId: input.periodId,
        status: "PENDING",
      };
    }),
});
