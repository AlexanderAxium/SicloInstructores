import { z } from "zod";
import { prisma } from "../../lib/db";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const penaltiesRouter = router({
  // Get all penalties (public)
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

      const [penalties, total] = await Promise.all([
        prisma.penalty.findMany({
          include: {
            instructor: {
              select: {
                id: true,
                name: true,
                fullName: true,
              },
            },
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
          orderBy: {
            appliedAt: "desc",
          },
          take: limit,
          skip: offset,
        }),
        prisma.penalty.count(),
      ]);

      return {
        penalties,
        total,
        hasMore: offset + limit < total,
      };
    }),

  // Get penalty by ID (public)
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const penalty = await prisma.penalty.findUnique({
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

      return penalty;
    }),

  // Get penalties with filters (protected)
  getWithFilters: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        instructorId: z.string().optional(),
        disciplineId: z.string().optional(),
        periodId: z.string().optional(),
        type: z
          .enum([
            "CANCELLATION_FIXED",
            "CANCELLATION_OUT_OF_TIME",
            "CANCEL_LESS_24HRS",
            "COVER_OF_COVER",
            "LATE_EXIT",
            "LATE_ARRIVAL",
            "CUSTOM",
          ])
          .optional(),
        active: z.boolean().optional(),
        appliedFrom: z.string().optional(),
        appliedTo: z.string().optional(),
        limit: z.number().min(1).max(1000).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const where: {
        tenantId?: string;
        OR?: Array<{
          type?: { contains: string; mode: "insensitive" };
          description?: { contains: string; mode: "insensitive" };
          comments?: { contains: string; mode: "insensitive" };
          instructor?: {
            name?: { contains: string; mode: "insensitive" };
            fullName?: { contains: string; mode: "insensitive" };
          };
          discipline?: {
            name?: { contains: string; mode: "insensitive" };
          };
        }>;
        instructorId?: string;
        disciplineId?: string;
        periodId?: string;
        type?: string;
        active?: boolean;
        appliedAt?: { gte?: Date; lte?: Date };
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
          { description: { contains: input.search, mode: "insensitive" } },
          { comments: { contains: input.search, mode: "insensitive" } },
        ];
      }

      if (input.instructorId) {
        where.instructorId = input.instructorId;
      }

      if (input.disciplineId) {
        where.disciplineId = input.disciplineId;
      }

      if (input.periodId) {
        where.periodId = input.periodId;
      }

      if (input.type) {
        where.type = input.type;
      }

      if (input.active !== undefined) {
        where.active = input.active;
      }

      if (input.appliedFrom || input.appliedTo) {
        where.appliedAt = {};
        if (input.appliedFrom) {
          where.appliedAt.gte = new Date(input.appliedFrom);
        }
        if (input.appliedTo) {
          where.appliedAt.lte = new Date(input.appliedTo);
        }
      }

      const [penalties, total] = await Promise.all([
        prisma.penalty.findMany({
          where,
          include: {
            instructor: {
              select: {
                id: true,
                name: true,
                fullName: true,
              },
            },
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
          orderBy: {
            appliedAt: "desc",
          },
          take: input.limit,
          skip: input.offset,
        }),
        prisma.penalty.count({ where }),
      ]);

      return {
        penalties,
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  // Create penalty (protected)
  create: protectedProcedure
    .input(
      z.object({
        instructorId: z.string(),
        disciplineId: z.string().optional(),
        periodId: z.string(),
        type: z.enum([
          "CANCELLATION_FIXED",
          "CANCELLATION_OUT_OF_TIME",
          "CANCEL_LESS_24HRS",
          "COVER_OF_COVER",
          "LATE_EXIT",
          "LATE_ARRIVAL",
          "CUSTOM",
        ]),
        points: z.number().min(0),
        description: z.string().optional().nullable(),
        active: z.boolean().default(true),
        appliedAt: z.string().optional(),
        comments: z.string().optional().nullable(),
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

      // Verify discipline exists if provided
      if (input.disciplineId) {
        const discipline = await prisma.discipline.findUnique({
          where: { id: input.disciplineId },
        });
        if (!discipline) {
          throw new Error("Discipline not found");
        }
      }

      const penalty = await prisma.penalty.create({
        data: {
          instructorId: input.instructorId,
          disciplineId: input.disciplineId,
          periodId: input.periodId,
          type: input.type,
          points: input.points,
          description: input.description,
          active: input.active,
          appliedAt: input.appliedAt ? new Date(input.appliedAt) : new Date(),
          comments: input.comments,
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

      return penalty;
    }),

  // Update penalty (protected)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        type: z
          .enum([
            "CANCELLATION_FIXED",
            "CANCELLATION_OUT_OF_TIME",
            "CANCEL_LESS_24HRS",
            "COVER_OF_COVER",
            "LATE_EXIT",
            "LATE_ARRIVAL",
            "CUSTOM",
          ])
          .optional(),
        points: z.number().optional(),
        description: z.string().optional().nullable(),
        active: z.boolean().optional(),
        appliedAt: z.string().optional(),
        comments: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      const { id, ...updateData } = input;

      // Convert date string to Date object if provided
      const { appliedAt, ...restData } = updateData;
      const dataToUpdate = {
        ...restData,
        ...(appliedAt && { appliedAt: new Date(appliedAt) }),
      };

      const penalty = await prisma.penalty.update({
        where: {
          id,
          tenantId: ctx.user.tenantId,
        },
        data: dataToUpdate,
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              fullName: true,
            },
          },
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

      return penalty;
    }),

  // Delete penalty (protected)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      await prisma.penalty.delete({
        where: {
          id: input.id,
          tenantId: ctx.user.tenantId,
        },
      });

      return { success: true };
    }),

  // Get penalty statistics (protected)
  getStats: protectedProcedure
    .input(z.object({ penaltyId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      const penalty = await prisma.penalty.findUnique({
        where: {
          id: input.penaltyId,
          tenantId: ctx.user.tenantId,
        },
        include: {
          instructor: {
            select: {
              name: true,
              fullName: true,
            },
          },
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

      if (!penalty) {
        throw new Error("Penalty not found");
      }

      return {
        penalty,
        stats: {
          points: penalty.points,
          type: penalty.type,
          active: penalty.active,
          appliedAt: penalty.appliedAt,
        },
      };
    }),

  // Get penalties by instructor (protected)
  getByInstructor: protectedProcedure
    .input(z.object({ instructorId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      const penalties = await prisma.penalty.findMany({
        where: {
          instructorId: input.instructorId,
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
        orderBy: {
          appliedAt: "desc",
        },
      });

      const totalPoints = penalties.reduce(
        (sum, penalty) => sum + penalty.points,
        0
      );
      const activePenalties = penalties.filter((p) => p.active);
      const totalActivePoints = activePenalties.reduce(
        (sum, penalty) => sum + penalty.points,
        0
      );

      return {
        penalties,
        stats: {
          total: penalties.length,
          totalPoints,
          active: activePenalties.length,
          totalActivePoints,
        },
      };
    }),
});
