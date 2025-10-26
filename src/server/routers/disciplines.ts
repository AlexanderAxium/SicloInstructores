import { z } from "zod";
import { prisma } from "../../lib/db";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const disciplinesRouter = router({
  // Get all disciplines (public)
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

      const [disciplines, total] = await Promise.all([
        prisma.discipline.findMany({
          orderBy: {
            name: "asc",
          },
          take: limit,
          skip: offset,
        }),
        prisma.discipline.count(),
      ]);

      return {
        disciplines,
        total,
        hasMore: offset + limit < total,
      };
    }),

  // Get discipline by ID (public)
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const discipline = await prisma.discipline.findUnique({
        where: {
          id: input.id,
        },
        include: {
          instructors: {
            select: {
              id: true,
              name: true,
              fullName: true,
              active: true,
            },
          },
          classes: {
            select: {
              id: true,
              date: true,
              studio: true,
              room: true,
              totalReservations: true,
              paidReservations: true,
              spots: true,
            },
            orderBy: {
              date: "desc",
            },
            take: 10, // Last 10 classes
          },
          _count: {
            select: {
              instructors: true,
              classes: true,
            },
          },
        },
      });

      return discipline;
    }),

  // Get disciplines with filters (protected)
  getWithFilters: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
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
          description?: { contains: string; mode: "insensitive" };
        }>;
        active?: boolean;
      } = {
        tenantId: ctx.user?.tenantId || undefined,
      };

      if (input.search) {
        where.OR = [
          { name: { contains: input.search, mode: "insensitive" } },
          { description: { contains: input.search, mode: "insensitive" } },
        ];
      }

      if (input.active !== undefined) {
        where.active = input.active;
      }

      const [disciplines, total] = await Promise.all([
        prisma.discipline.findMany({
          where,
          include: {
            _count: {
              select: {
                instructors: true,
                classes: true,
              },
            },
          },
          orderBy: {
            name: "asc",
          },
          take: input.limit,
          skip: input.offset,
        }),
        prisma.discipline.count({ where }),
      ]);

      return {
        disciplines,
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  // Create discipline (protected)
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        color: z.string().optional(),
        active: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      // Check if discipline with same name already exists
      const existingDiscipline = await prisma.discipline.findFirst({
        where: {
          name: input.name,
          tenantId: ctx.user.tenantId,
        },
      });

      if (existingDiscipline) {
        throw new Error("A discipline with this name already exists");
      }

      const discipline = await prisma.discipline.create({
        data: {
          name: input.name,
          description: input.description,
          color: input.color,
          active: input.active,
          tenantId: ctx.user.tenantId,
        },
      });

      return discipline;
    }),

  // Update discipline (protected)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        color: z.string().optional(),
        active: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      const { id, ...updateData } = input;

      // Check if name is being changed and if it conflicts with existing discipline
      if (updateData.name) {
        const existingDiscipline = await prisma.discipline.findFirst({
          where: {
            name: updateData.name,
            tenantId: ctx.user.tenantId,
            NOT: { id },
          },
        });

        if (existingDiscipline) {
          throw new Error("A discipline with this name already exists");
        }
      }

      const discipline = await prisma.discipline.update({
        where: {
          id,
          tenantId: ctx.user.tenantId,
        },
        data: updateData,
      });

      return discipline;
    }),

  // Delete discipline (protected)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      // Check if discipline has related data
      const discipline = await prisma.discipline.findUnique({
        where: { id: input.id },
        include: {
          _count: {
            select: {
              instructors: true,
              classes: true,
            },
          },
        },
      });

      if (!discipline) {
        throw new Error("Discipline not found");
      }

      if (discipline._count.instructors > 0 || discipline._count.classes > 0) {
        throw new Error(
          "Cannot delete discipline with associated instructors or classes"
        );
      }

      await prisma.discipline.delete({
        where: {
          id: input.id,
          tenantId: ctx.user.tenantId,
        },
      });

      return { success: true };
    }),

  // Get discipline statistics (protected)
  getStats: protectedProcedure
    .input(z.object({ disciplineId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      const discipline = await prisma.discipline.findUnique({
        where: {
          id: input.disciplineId,
          tenantId: ctx.user.tenantId,
        },
        include: {
          _count: {
            select: {
              instructors: true,
              classes: true,
            },
          },
        },
      });

      if (!discipline) {
        throw new Error("Discipline not found");
      }

      // Get recent class performance
      const recentClasses = await prisma.class.findMany({
        where: {
          disciplineId: input.disciplineId,
          tenantId: ctx.user.tenantId,
        },
        select: {
          totalReservations: true,
          paidReservations: true,
          spots: true,
          date: true,
        },
        orderBy: {
          date: "desc",
        },
        take: 20,
      });

      const avgOccupation =
        recentClasses.length > 0
          ? recentClasses.reduce(
              (sum, cls) => sum + cls.paidReservations / cls.spots,
              0
            ) / recentClasses.length
          : 0;

      return {
        discipline,
        stats: {
          totalInstructors: discipline._count.instructors,
          totalClasses: discipline._count.classes,
          avgOccupation: Math.round(avgOccupation * 100) / 100,
          recentClassesCount: recentClasses.length,
        },
      };
    }),
});
