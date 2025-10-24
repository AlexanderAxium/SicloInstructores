import { z } from "zod";
import { prisma } from "../../lib/db";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const brandingsRouter = router({
  // Get all brandings (public)
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

      const [brandings, total] = await Promise.all([
        prisma.branding.findMany({
          include: {
            instructor: {
              select: {
                id: true,
                name: true,
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
          orderBy: [{ createdAt: "desc" }],
          take: limit,
          skip: offset,
        }),
        prisma.branding.count(),
      ]);

      return {
        brandings,
        total,
        hasMore: offset + limit < total,
      };
    }),

  // Get branding by ID (public)
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const branding = await prisma.branding.findUnique({
        where: {
          id: input.id,
        },
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
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

      return branding;
    }),

  // Get brandings with filters (protected)
  getWithFilters: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        search: z.string().optional(),
        instructorId: z.string().optional(),
        periodId: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { limit, offset, search, instructorId, periodId } = input;
      const { user } = ctx;

      if (!user?.tenantId) {
        throw new Error("Tenant ID is required");
      }

      const where: any = {
        tenantId: user.tenantId,
      };

      if (search) {
        where.OR = [
          {
            instructor: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
          {
            comments: {
              contains: search,
              mode: "insensitive",
            },
          },
        ];
      }

      if (instructorId) {
        where.instructorId = instructorId;
      }

      if (periodId) {
        where.periodId = periodId;
      }

      const [brandings, total] = await Promise.all([
        prisma.branding.findMany({
          where,
          include: {
            instructor: {
              select: {
                id: true,
                name: true,
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
          orderBy: [{ createdAt: "desc" }],
          take: limit,
          skip: offset,
        }),
        prisma.branding.count({ where }),
      ]);

      return {
        brandings,
        total,
        hasMore: offset + limit < total,
      };
    }),

  // Create branding (protected)
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
      const { user } = ctx;

      if (!user?.tenantId) {
        throw new Error("Tenant ID is required");
      }

      const branding = await prisma.branding.create({
        data: {
          ...input,
          tenantId: user.tenantId,
        },
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
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

      return branding;
    }),

  // Update branding (protected)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        number: z.number().min(1),
        instructorId: z.string(),
        periodId: z.string(),
        comments: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx;

      if (!user?.tenantId) {
        throw new Error("Tenant ID is required");
      }

      const branding = await prisma.branding.update({
        where: {
          id: input.id,
          tenantId: user.tenantId,
        },
        data: {
          number: input.number,
          instructorId: input.instructorId,
          periodId: input.periodId,
          comments: input.comments,
        },
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
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

      return branding;
    }),

  // Delete branding (protected)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx;

      if (!user?.tenantId) {
        throw new Error("Tenant ID is required");
      }

      await prisma.branding.delete({
        where: {
          id: input.id,
          tenantId: user.tenantId,
        },
      });

      return { success: true };
    }),
});
