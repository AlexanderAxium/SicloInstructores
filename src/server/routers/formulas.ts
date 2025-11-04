import { z } from "zod";
import { prisma } from "../../lib/db";
import type {
  CategoryRequirements,
  PaymentParameters,
} from "../../types/schema";
import { protectedProcedure, publicProcedure, router } from "../trpc";

// Schema for category requirements (matching old system)
const categoryRequirementsSchema = z.object({
  ocupacion: z.number(),
  clases: z.number(),
  localesEnLima: z.number(),
  dobleteos: z.number(),
  horariosNoPrime: z.number(),
  participacionEventos: z.boolean(),
  antiguedadMinima: z.number().optional(),
  evaluacionPromedio: z.number().optional(),
  capacitacionesCompletadas: z.number().optional(),
  lineamientos: z.boolean(),
});

// Schema for payment parameters (matching old system)
const paymentParametersSchema = z.object({
  cuotaFija: z.number(),
  minimoGarantizado: z.number(),
  tarifas: z.array(
    z.object({
      tarifa: z.number(),
      numeroReservas: z.number(),
    })
  ),
  tarifaFullHouse: z.number(),
  maximo: z.number(),
  bono: z.number(),
  retencionPorcentaje: z.number().optional(),
  ajustePorDobleteo: z.number().optional(),
});

export const formulasRouter = router({
  // Get all formulas (public)
  getAll: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(1000).default(1000),
          offset: z.number().min(0).default(0),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const limit = input?.limit ?? 1000;
      const offset = input?.offset ?? 0;

      const [formulas, total] = await Promise.all([
        prisma.formula.findMany({
          include: {
            discipline: {
              select: {
                id: true,
                name: true,
                color: true,
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
          orderBy: [{ period: { startDate: "desc" } }, { createdAt: "desc" }],
          take: limit,
          skip: offset,
        }),
        prisma.formula.count(),
      ]);

      return {
        formulas,
        total,
        hasMore: offset + limit < total,
      };
    }),

  // Get formula by ID (public)
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const formula = await prisma.formula.findUnique({
        where: {
          id: input.id,
        },
        include: {
          discipline: {
            select: {
              id: true,
              name: true,
              color: true,
              description: true,
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

      return formula;
    }),

  // Get formulas with filters (protected)
  getWithFilters: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        disciplineId: z.string().optional(),
        periodId: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const where: {
        tenantId?: string;
        disciplineId?: string;
        periodId?: string;
      } = {
        tenantId: ctx.user?.tenantId || undefined,
      };

      if (input.disciplineId) {
        where.disciplineId = input.disciplineId;
      }

      if (input.periodId) {
        where.periodId = input.periodId;
      }

      const [formulas, total] = await Promise.all([
        prisma.formula.findMany({
          where,
          include: {
            discipline: {
              select: {
                id: true,
                name: true,
                color: true,
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
          orderBy: [{ period: { startDate: "desc" } }, { createdAt: "desc" }],
          take: input.limit,
          skip: input.offset,
        }),
        prisma.formula.count({ where }),
      ]);

      return {
        formulas,
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  // Create formula (protected)
  create: protectedProcedure
    .input(
      z.object({
        disciplineId: z.string(),
        periodId: z.string(),
        categoryRequirements: z.record(categoryRequirementsSchema),
        paymentParameters: z.record(paymentParametersSchema),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      // Verify discipline exists
      const discipline = await prisma.discipline.findUnique({
        where: { id: input.disciplineId },
      });
      if (!discipline) {
        throw new Error("Discipline not found");
      }

      // Verify period exists
      const period = await prisma.period.findUnique({
        where: { id: input.periodId },
      });
      if (!period) {
        throw new Error("Period not found");
      }

      // Check if formula already exists for this discipline and period
      const existingFormula = await prisma.formula.findFirst({
        where: {
          disciplineId: input.disciplineId,
          periodId: input.periodId,
          tenantId: ctx.user.tenantId,
        },
      });

      if (existingFormula) {
        throw new Error(
          "A formula already exists for this discipline and period"
        );
      }

      const formula = await prisma.formula.create({
        data: {
          disciplineId: input.disciplineId,
          periodId: input.periodId,
          categoryRequirements: input.categoryRequirements,
          paymentParameters: input.paymentParameters,
          tenantId: ctx.user.tenantId,
        },
        include: {
          discipline: {
            select: {
              id: true,
              name: true,
              color: true,
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

      return formula;
    }),

  // Update formula (protected)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        disciplineId: z.string().optional(),
        periodId: z.string().optional(),
        categoryRequirements: z.record(categoryRequirementsSchema).optional(),
        paymentParameters: z.record(paymentParametersSchema).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      const { id, ...updateData } = input;

      const formula = await prisma.formula.update({
        where: {
          id,
          tenantId: ctx.user.tenantId,
        },
        data: updateData,
        include: {
          discipline: {
            select: {
              id: true,
              name: true,
              color: true,
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

      return formula;
    }),

  // Delete formula (protected)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      await prisma.formula.delete({
        where: {
          id: input.id,
          tenantId: ctx.user.tenantId,
        },
      });

      return { success: true };
    }),

  // Get formula statistics (protected)
  getStats: protectedProcedure
    .input(z.object({ formulaId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      const formula = await prisma.formula.findUnique({
        where: {
          id: input.formulaId,
          tenantId: ctx.user.tenantId,
        },
        include: {
          discipline: {
            select: {
              name: true,
              color: true,
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

      if (!formula) {
        throw new Error("Formula not found");
      }

      return {
        formula,
        stats: {
          categoryRequirements: formula.categoryRequirements,
          paymentParameters: formula.paymentParameters,
          createdAt: formula.createdAt,
        },
      };
    }),

  // Get formulas by period (protected - supports both users and instructors)
  getByPeriod: protectedProcedure
    .input(z.object({ periodId: z.string() }))
    .query(async ({ input, ctx }) => {
      const tenantId = ctx.user?.tenantId || ctx.instructor?.tenantId;
      if (!tenantId) {
        throw new Error("User or instructor tenant not found");
      }

      const formulas = await prisma.formula.findMany({
        where: {
          periodId: input.periodId,
          tenantId: tenantId,
        },
        include: {
          discipline: {
            select: {
              name: true,
              color: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const uniqueDisciplines = new Set(
        formulas.map((f: { disciplineId: string }) => f.disciplineId)
      ).size;

      return {
        formulas,
        stats: {
          total: formulas.length,
          uniqueDisciplines,
        },
      };
    }),

  // Get formulas by discipline (protected)
  getByDiscipline: protectedProcedure
    .input(z.object({ disciplineId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      const formulas = await prisma.formula.findMany({
        where: {
          disciplineId: input.disciplineId,
          tenantId: ctx.user.tenantId,
        },
        include: {
          period: {
            select: {
              number: true,
              year: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return {
        formulas,
        stats: {
          total: formulas.length,
        },
      };
    }),

  // Duplicate formulas from one period to another (protected)
  duplicateToPeriod: protectedProcedure
    .input(
      z.object({
        fromPeriodId: z.string(),
        toPeriodId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      // Verify periods exist
      const [fromPeriod, toPeriod] = await Promise.all([
        prisma.period.findUnique({
          where: { id: input.fromPeriodId },
        }),
        prisma.period.findUnique({
          where: { id: input.toPeriodId },
        }),
      ]);

      if (!fromPeriod) {
        throw new Error("Período origen no encontrado");
      }

      if (!toPeriod) {
        throw new Error("Período destino no encontrado");
      }

      // Get all formulas from source period
      const sourceFormulas = await prisma.formula.findMany({
        where: {
          periodId: input.fromPeriodId,
          tenantId: ctx.user.tenantId,
        },
        include: {
          discipline: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (sourceFormulas.length === 0) {
        return {
          success: true,
          message: "No se encontraron fórmulas en el período origen",
          duplicatedCount: 0,
        };
      }

      // Delete all existing formulas in target period
      await prisma.formula.deleteMany({
        where: {
          periodId: input.toPeriodId,
          tenantId: ctx.user.tenantId,
        },
      });

      // Create new formulas for target period
      const tenantId = ctx.user.tenantId;
      const duplicatedFormulas = await Promise.all(
        sourceFormulas.map((formula) =>
          prisma.formula.create({
            data: {
              disciplineId: formula.disciplineId,
              periodId: input.toPeriodId,
              categoryRequirements: JSON.parse(
                JSON.stringify(formula.categoryRequirements)
              ),
              paymentParameters: JSON.parse(
                JSON.stringify(formula.paymentParameters)
              ),
              tenantId,
            },
          })
        )
      );

      return {
        success: true,
        message: `Se duplicaron exitosamente ${duplicatedFormulas.length} fórmulas del Período ${fromPeriod.number}/${fromPeriod.year} al Período ${toPeriod.number}/${toPeriod.year}`,
        duplicatedCount: duplicatedFormulas.length,
      };
    }),
});
