import { z } from "zod";
import { prisma } from "../../lib/db";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const workshopsRouter = router({
  // Get all workshops (public)
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

      const [workshops, total] = await Promise.all([
        prisma.workshop.findMany({
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
            date: "desc",
          },
          take: limit,
          skip: offset,
        }),
        prisma.workshop.count(),
      ]);

      return {
        workshops,
        total,
        hasMore: offset + limit < total,
      };
    }),

  // Get workshop by ID (public)
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const workshop = await prisma.workshop.findUnique({
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

      return workshop;
    }),

  // Get workshops with filters (protected)
  getWithFilters: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        instructorId: z.string().optional(),
        periodId: z.string().optional(),
        name: z.string().optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
        active: z.boolean().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const where: {
        tenantId?: string;
        OR?: Array<{
          name?: { contains: string; mode: "insensitive" };
          instructor?: {
            name?: { contains: string; mode: "insensitive" };
            fullName?: { contains: string; mode: "insensitive" };
          };
        }>;
        instructorId?: string;
        periodId?: string;
        name?: { contains: string; mode: "insensitive" };
        date?: {
          gte?: Date;
          lte?: Date;
        };
      } = {
        tenantId: ctx.user?.tenantId || undefined,
      };

      if (input.search) {
        where.OR = [
          { name: { contains: input.search, mode: "insensitive" } },
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

      if (input.periodId) {
        where.periodId = input.periodId;
      }

      if (input.name) {
        where.name = {
          contains: input.name,
          mode: "insensitive",
        };
      }

      if (input.dateFrom || input.dateTo) {
        where.date = {};
        if (input.dateFrom) {
          where.date.gte = new Date(input.dateFrom);
        }
        if (input.dateTo) {
          where.date.lte = new Date(input.dateTo);
        }
      }

      // Note: Workshop model doesn't have an 'active' field

      const [workshops, total] = await Promise.all([
        prisma.workshop.findMany({
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
            date: "desc",
          },
          take: input.limit,
          skip: input.offset,
        }),
        prisma.workshop.count({ where }),
      ]);

      return {
        workshops,
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  // Create workshop (protected)
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        instructorId: z.string(),
        periodId: z.string(),
        date: z.string(),
        comments: z.string().optional(),
        payment: z.number().min(0),
        // Note: Workshop model doesn't have an 'active' field
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

      const workshop = await prisma.workshop.create({
        data: {
          name: input.name,
          instructorId: input.instructorId,
          periodId: input.periodId,
          date: new Date(input.date),
          comments: input.comments,
          payment: input.payment,
          // Note: Workshop model doesn't have an 'active' field
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

      return workshop;
    }),

  // Update workshop (protected)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        instructorId: z.string().optional(),
        periodId: z.string().optional(),
        date: z.string().optional(),
        comments: z.string().optional(),
        payment: z.number().optional(),
        active: z.boolean().optional(),
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

      // Handle date conversion
      const { date, ...restData } = updateData;
      const dataToUpdate = {
        ...restData,
        ...(date && { date: new Date(date) }),
      };

      const workshop = await prisma.workshop.update({
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
          period: {
            select: {
              id: true,
              number: true,
              year: true,
            },
          },
        },
      });

      return workshop;
    }),

  // Delete workshop (protected)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      await prisma.workshop.delete({
        where: {
          id: input.id,
          tenantId: ctx.user.tenantId,
        },
      });

      return { success: true };
    }),

  // Get workshop statistics (protected)
  getStats: protectedProcedure
    .input(z.object({ workshopId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      const workshop = await prisma.workshop.findUnique({
        where: {
          id: input.workshopId,
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

      if (!workshop) {
        throw new Error("Workshop not found");
      }

      return {
        workshop,
        stats: {
          payment: workshop.payment,
          date: workshop.date,
        },
      };
    }),

  // Get workshops by instructor (protected)
  getByInstructor: protectedProcedure
    .input(z.object({ instructorId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      const workshops = await prisma.workshop.findMany({
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
          date: "desc",
        },
      });

      const totalPayment = workshops.reduce(
        (sum, workshop) => sum + workshop.payment,
        0
      );
      const activeWorkshops = workshops; // All workshops are considered active

      return {
        workshops,
        stats: {
          total: workshops.length,
          totalPayment,
          active: activeWorkshops.length,
          activePayment: activeWorkshops.reduce(
            (sum, workshop) => sum + workshop.payment,
            0
          ),
        },
      };
    }),

  // Get workshops by period (protected)
  getByPeriod: protectedProcedure
    .input(z.object({ periodId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      const workshops = await prisma.workshop.findMany({
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
          date: "desc",
        },
      });

      const totalPayment = workshops.reduce(
        (sum, workshop) => sum + workshop.payment,
        0
      );
      const uniqueInstructors = new Set(workshops.map((w) => w.instructorId))
        .size;

      return {
        workshops,
        stats: {
          total: workshops.length,
          totalPayment,
          uniqueInstructors,
        },
      };
    }),
});
