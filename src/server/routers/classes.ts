import { z } from "zod";
import { prisma } from "../../lib/db";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const classesRouter = router({
  // Get all classes (public)
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

      const [classes, total] = await Promise.all([
        prisma.class.findMany({
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
          orderBy: [{ date: "desc" }, { week: "desc" }, { id: "asc" }],
          take: limit,
          skip: offset,
        }),
        prisma.class.count(),
      ]);

      return {
        classes,
        total,
        hasMore: offset + limit < total,
      };
    }),

  // Get class by ID (public)
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const classItem = await prisma.class.findUnique({
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

      return classItem;
    }),

  // Get classes by instructor and period (public)
  getByInstructorAndPeriod: publicProcedure
    .input(
      z.object({
        instructorId: z.string(),
        periodId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const classes = await prisma.class.findMany({
        where: {
          instructorId: input.instructorId,
          periodId: input.periodId,
        },
        include: {
          discipline: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
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
        orderBy: [{ date: "asc" }, { week: "asc" }],
      });

      return {
        classes,
        total: classes.length,
      };
    }),

  // Get classes by instructor (public)
  getByInstructor: publicProcedure
    .input(z.object({ instructorId: z.string() }))
    .query(async ({ input }) => {
      const classes = await prisma.class.findMany({
        where: {
          instructorId: input.instructorId,
        },
        include: {
          discipline: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
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
        orderBy: [{ date: "desc" }, { week: "desc" }],
      });

      return {
        classes,
        total: classes.length,
      };
    }),

  // Get classes with filters (protected)
  getWithFilters: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        instructorId: z.string().optional(),
        disciplineId: z.string().optional(),
        periodId: z.string().optional(),
        periodStart: z.string().optional(),
        periodEnd: z.string().optional(),
        week: z.number().optional(),
        date: z.string().optional(),
        studio: z.string().optional(),
        active: z.boolean().optional(),
        limit: z.number().min(1).max(1000).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const where: {
        tenantId?: string;
        OR?: Array<{
          studio?: { contains: string; mode: "insensitive" };
          room?: { contains: string; mode: "insensitive" };
          specialText?: { contains: string; mode: "insensitive" };
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
        week?: number;
        country?: string;
        city?: string;
        studio?: { contains: string; mode: "insensitive" };
        isVersus?: boolean;
        date?: Date | { gte?: Date; lte?: Date };
      } = {
        tenantId: ctx.user?.tenantId || ctx.instructor?.tenantId || undefined,
      };

      if (input.search) {
        where.OR = [
          { studio: { contains: input.search, mode: "insensitive" } },
          { room: { contains: input.search, mode: "insensitive" } },
          { specialText: { contains: input.search, mode: "insensitive" } },
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
        ];
      }

      if (input.instructorId) {
        where.instructorId = input.instructorId;
      }

      if (input.disciplineId) {
        where.disciplineId = input.disciplineId;
      }

      // Handle period filtering
      if (input.periodId) {
        where.periodId = input.periodId;
      } else if (input.periodStart || input.periodEnd) {
        // For period range filtering, we need to filter by period number through the relation
        // This requires a more complex query structure
        const periodNumberFilter: Record<string, number> = {};
        if (input.periodStart) {
          periodNumberFilter.gte = Number.parseInt(input.periodStart);
        }
        if (input.periodEnd) {
          periodNumberFilter.lte = Number.parseInt(input.periodEnd);
        }
        // Note: This would require a different approach using a subquery or join
        // For now, we'll skip period range filtering if periodId is not provided
        // TODO: Implement proper period range filtering through period relation
      }

      if (input.week !== undefined) {
        where.week = input.week;
      }

      if (input.date) {
        where.date = new Date(input.date);
      }

      if (input.studio) {
        where.studio = {
          contains: input.studio,
          mode: "insensitive",
        };
      }

      // Note: Class model doesn't have an 'active' field, removing this filter

      const [classes, total] = await Promise.all([
        prisma.class.findMany({
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
          orderBy: [{ date: "desc" }, { week: "desc" }, { id: "asc" }],
          take: input.limit,
          skip: input.offset,
        }),
        prisma.class.count({ where }),
      ]);

      return {
        classes,
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  // Create class (protected)
  create: protectedProcedure
    .input(
      z.object({
        country: z.string().min(1),
        city: z.string().min(1),
        disciplineId: z.string(),
        week: z.number(),
        studio: z.string().min(1),
        instructorId: z.string(),
        periodId: z.string(),
        room: z.string().min(1),
        spots: z.number().min(1),
        totalReservations: z.number().default(0),
        paidReservations: z.number().default(0),
        waitingLists: z.number().default(0),
        complimentary: z.number().default(0),
        specialText: z.string().optional(),
        date: z.string(),
        isVersus: z.boolean().default(false),
        versusNumber: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const tenantId = ctx.user?.tenantId || ctx.instructor?.tenantId;
      if (!tenantId) {
        throw new Error("Tenant not found");
      }

      // Verify instructor exists
      const instructor = await prisma.instructor.findUnique({
        where: { id: input.instructorId },
      });
      if (!instructor) {
        throw new Error("Instructor not found");
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

      const classItem = await prisma.class.create({
        data: {
          country: input.country,
          city: input.city,
          disciplineId: input.disciplineId,
          week: input.week,
          studio: input.studio,
          instructorId: input.instructorId,
          periodId: input.periodId,
          room: input.room,
          spots: input.spots,
          totalReservations: input.totalReservations,
          paidReservations: input.paidReservations,
          waitingLists: input.waitingLists,
          complimentary: input.complimentary,
          specialText: input.specialText,
          date: new Date(input.date),
          isVersus: input.isVersus,
          versusNumber: input.versusNumber,
          tenantId: tenantId,
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

      return classItem;
    }),

  // Update class (protected)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        country: z.string().optional(),
        city: z.string().optional(),
        disciplineId: z.string().optional(),
        week: z.number().optional(),
        studio: z.string().optional(),
        instructorId: z.string().optional(),
        periodId: z.string().optional(),
        room: z.string().optional(),
        spots: z.number().optional(),
        totalReservations: z.number().optional(),
        paidReservations: z.number().optional(),
        waitingLists: z.number().optional(),
        complimentary: z.number().optional(),
        specialText: z.string().optional(),
        date: z.string().optional(),
        isVersus: z.boolean().optional(),
        versusNumber: z.number().optional(),
        active: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const tenantId = ctx.user?.tenantId || ctx.instructor?.tenantId;
      if (!tenantId) {
        throw new Error("Tenant not found");
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

      if (updateData.disciplineId) {
        const discipline = await prisma.discipline.findUnique({
          where: { id: updateData.disciplineId },
        });
        if (!discipline) {
          throw new Error("Discipline not found");
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

      // Handle date conversion
      const { date, ...restData } = updateData;
      const dataToUpdate = {
        ...restData,
        ...(date && { date: new Date(date) }),
      };

      const classItem = await prisma.class.update({
        where: {
          id,
          tenantId: tenantId,
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

      return classItem;
    }),

  // Delete class (protected)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const tenantId = ctx.user?.tenantId || ctx.instructor?.tenantId;
      if (!tenantId) {
        throw new Error("Tenant not found");
      }

      await prisma.class.delete({
        where: {
          id: input.id,
          tenantId: tenantId,
        },
      });

      return { success: true };
    }),

  // Get class statistics (protected)
  getStats: protectedProcedure
    .input(z.object({ classId: z.string() }))
    .query(async ({ input, ctx }) => {
      const tenantId = ctx.user?.tenantId || ctx.instructor?.tenantId;
      if (!tenantId) {
        throw new Error("Tenant not found");
      }

      const classItem = await prisma.class.findUnique({
        where: {
          id: input.classId,
          tenantId: tenantId,
        },
        select: {
          id: true,
          studio: true,
          room: true,
          date: true,
          spots: true,
          totalReservations: true,
          paidReservations: true,
          waitingLists: true,
          complimentary: true,
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
        },
      });

      if (!classItem) {
        throw new Error("Class not found");
      }

      const occupationRate =
        classItem.spots > 0
          ? (classItem.paidReservations / classItem.spots) * 100
          : 0;

      return {
        class: classItem,
        stats: {
          occupationRate: Math.round(occupationRate * 100) / 100,
          totalReservations: classItem.totalReservations,
          paidReservations: classItem.paidReservations,
          waitingLists: classItem.waitingLists,
          complimentary: classItem.complimentary,
          spots: classItem.spots,
        },
      };
    }),
});
