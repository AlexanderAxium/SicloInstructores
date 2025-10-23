import { z } from "zod";
import { prisma } from "../../lib/db";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const themeRidesRouter = router({
  // Get all theme rides (public)
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

      const [themeRides, total] = await Promise.all([
        prisma.themeRide.findMany({
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
          orderBy: {
            createdAt: "desc",
          },
          take: limit,
          skip: offset,
        }),
        prisma.themeRide.count(),
      ]);

      return {
        themeRides,
        total,
        hasMore: offset + limit < total,
      };
    }),

  // Get theme ride by ID (public)
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const themeRide = await prisma.themeRide.findUnique({
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

      return themeRide;
    }),

  // Get theme rides with filters (protected)
  getWithFilters: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        instructorId: z.string().optional(),
        periodId: z.string().optional(),
        number: z.number().optional(),
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
          };
          comments?: { contains: string; mode: "insensitive" };
        }>;
        instructorId?: string;
        periodId?: string;
        number?: number;
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
          { comments: { contains: input.search, mode: "insensitive" } },
        ];
      }

      if (input.instructorId) {
        where.instructorId = input.instructorId;
      }

      if (input.periodId) {
        where.periodId = input.periodId;
      }

      if (input.number !== undefined) {
        where.number = input.number;
      }

      const [themeRides, total] = await Promise.all([
        prisma.themeRide.findMany({
          where,
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
          orderBy: {
            createdAt: "desc",
          },
          take: input.limit,
          skip: input.offset,
        }),
        prisma.themeRide.count({ where }),
      ]);

      return {
        themeRides,
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  // Create theme ride (protected)
  create: protectedProcedure
    .input(
      z.object({
        number: z.number().min(1),
        instructorId: z.string(),
        periodId: z.string(),
        comments: z.string().optional(),
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

      const themeRide = await prisma.themeRide.create({
        data: {
          number: input.number,
          instructorId: input.instructorId,
          periodId: input.periodId,
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
          period: {
            select: {
              id: true,
              number: true,
              year: true,
            },
          },
        },
      });

      return themeRide;
    }),

  // Update theme ride (protected)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        number: z.number().optional(),
        instructorId: z.string().optional(),
        periodId: z.string().optional(),
        comments: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      const { id, ...updateData } = input;

      // Verify related entities exist if they're being updated
      if (updateData.instructorId) {
        const instructor = await prisma.instructor.findUnique({
          where: { id: updateData.instructorId },
        });
        if (!instructor) {
          throw new Error("Instructor not found");
        }
      }

      if (updateData.periodId) {
        const period = await prisma.period.findUnique({
          where: { id: updateData.periodId },
        });
        if (!period) {
          throw new Error("Period not found");
        }
      }

      const themeRide = await prisma.themeRide.update({
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

      return themeRide;
    }),

  // Delete theme ride (protected)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      await prisma.themeRide.delete({
        where: {
          id: input.id,
          tenantId: ctx.user.tenantId,
        },
      });

      return { success: true };
    }),

  // Get theme ride statistics (protected)
  getStats: protectedProcedure
    .input(z.object({ themeRideId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      const themeRide = await prisma.themeRide.findUnique({
        where: {
          id: input.themeRideId,
          tenantId: ctx.user.tenantId,
        },
        include: {
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

      if (!themeRide) {
        throw new Error("Theme ride not found");
      }

      return {
        themeRide,
        stats: {
          number: themeRide.number,
          createdAt: themeRide.createdAt,
        },
      };
    }),

  // Get theme rides by instructor (protected)
  getByInstructor: protectedProcedure
    .input(z.object({ instructorId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      const themeRides = await prisma.themeRide.findMany({
        where: {
          instructorId: input.instructorId,
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
        themeRides,
        stats: {
          total: themeRides.length,
        },
      };
    }),

  // Get theme rides by period (protected)
  getByPeriod: protectedProcedure
    .input(z.object({ periodId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      const themeRides = await prisma.themeRide.findMany({
        where: {
          periodId: input.periodId,
          tenantId: ctx.user.tenantId,
        },
        include: {
          instructor: {
            select: {
              name: true,
              fullName: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const uniqueInstructors = new Set(themeRides.map((tr) => tr.instructorId))
        .size;

      return {
        themeRides,
        stats: {
          total: themeRides.length,
          uniqueInstructors,
        },
      };
    }),
});
