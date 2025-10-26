import { z } from "zod";
import { prisma } from "../../lib/db";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const coversRouter = router({
  // Get all covers (public)
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

      const [covers, total] = await Promise.all([
        prisma.cover.findMany({
          include: {
            originalInstructor: {
              select: {
                id: true,
                name: true,
                fullName: true,
              },
            },
            replacementInstructor: {
              select: {
                id: true,
                name: true,
                fullName: true,
              },
            },
            class: {
              select: {
                id: true,
                date: true,
                studio: true,
                room: true,
                discipline: {
                  select: {
                    name: true,
                    color: true,
                  },
                },
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
        prisma.cover.count(),
      ]);

      return {
        covers,
        total,
        hasMore: offset + limit < total,
      };
    }),

  // Get cover by ID (public)
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const cover = await prisma.cover.findUnique({
        where: {
          id: input.id,
        },
        include: {
          originalInstructor: {
            select: {
              id: true,
              name: true,
              fullName: true,
              phone: true,
              DNI: true,
            },
          },
          replacementInstructor: {
            select: {
              id: true,
              name: true,
              fullName: true,
              phone: true,
              DNI: true,
            },
          },
          class: {
            select: {
              id: true,
              date: true,
              studio: true,
              room: true,
              totalReservations: true,
              paidReservations: true,
              spots: true,
              discipline: {
                select: {
                  name: true,
                  color: true,
                },
              },
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

      return cover;
    }),

  // Get covers with filters (protected)
  getWithFilters: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        originalInstructorId: z.string().optional(),
        replacementInstructorId: z.string().optional(),
        classId: z.string().optional(),
        periodId: z.string().optional(),
        justification: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
        limit: z.number().min(1).max(1000).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const where: {
        tenantId?: string;
        OR?: Array<{
          originalInstructor?: {
            name?: { contains: string; mode: "insensitive" };
            fullName?: { contains: string; mode: "insensitive" };
          };
          replacementInstructor?: {
            name?: { contains: string; mode: "insensitive" };
            fullName?: { contains: string; mode: "insensitive" };
          };
          comments?: { contains: string; mode: "insensitive" };
        }>;
        originalInstructorId?: string;
        replacementInstructorId?: string;
        disciplineId?: string;
        periodId?: string;
        classId?: string;
        justification?: "PENDING" | "APPROVED" | "REJECTED";
      } = {
        tenantId: ctx.user?.tenantId || undefined,
      };

      if (input.search) {
        where.OR = [
          {
            originalInstructor: {
              name: { contains: input.search, mode: "insensitive" },
            },
          },
          {
            originalInstructor: {
              fullName: { contains: input.search, mode: "insensitive" },
            },
          },
          {
            replacementInstructor: {
              name: { contains: input.search, mode: "insensitive" },
            },
          },
          {
            replacementInstructor: {
              fullName: { contains: input.search, mode: "insensitive" },
            },
          },
          { comments: { contains: input.search, mode: "insensitive" } },
        ];
      }

      if (input.originalInstructorId) {
        where.originalInstructorId = input.originalInstructorId;
      }

      if (input.replacementInstructorId) {
        where.replacementInstructorId = input.replacementInstructorId;
      }

      if (input.classId) {
        where.classId = input.classId;
      }

      if (input.periodId) {
        where.periodId = input.periodId;
      }

      if (input.justification) {
        where.justification = input.justification;
      }

      const [covers, total] = await Promise.all([
        prisma.cover.findMany({
          where,
          include: {
            originalInstructor: {
              select: {
                id: true,
                name: true,
                fullName: true,
              },
            },
            replacementInstructor: {
              select: {
                id: true,
                name: true,
                fullName: true,
              },
            },
            class: {
              select: {
                id: true,
                date: true,
                studio: true,
                room: true,
                discipline: {
                  select: {
                    name: true,
                    color: true,
                  },
                },
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
        prisma.cover.count({ where }),
      ]);

      return {
        covers,
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  // Create cover (protected)
  create: protectedProcedure
    .input(
      z.object({
        originalInstructorId: z.string(),
        replacementInstructorId: z.string(),
        disciplineId: z.string(),
        periodId: z.string(),
        date: z.string(),
        time: z.string(),
        classId: z.string().optional(),
        justification: z
          .enum(["PENDING", "APPROVED", "REJECTED"])
          .default("PENDING"),
        bonusPayment: z.boolean().default(false),
        fullHousePayment: z.boolean().default(false),
        comments: z.string().optional(),
        nameChange: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      // Verify original instructor exists
      const originalInstructor = await prisma.instructor.findUnique({
        where: { id: input.originalInstructorId },
      });
      if (!originalInstructor) {
        throw new Error("Original instructor not found");
      }

      // Verify replacement instructor exists
      const replacementInstructor = await prisma.instructor.findUnique({
        where: { id: input.replacementInstructorId },
      });
      if (!replacementInstructor) {
        throw new Error("Replacement instructor not found");
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

      // Verify class exists if provided
      if (input.classId) {
        const classItem = await prisma.class.findUnique({
          where: { id: input.classId },
        });
        if (!classItem) {
          throw new Error("Class not found");
        }
      }

      const cover = await prisma.cover.create({
        data: {
          originalInstructorId: input.originalInstructorId,
          replacementInstructorId: input.replacementInstructorId,
          disciplineId: input.disciplineId,
          periodId: input.periodId,
          date: new Date(input.date),
          time: input.time,
          classId: input.classId,
          justification: input.justification,
          bonusPayment: input.bonusPayment,
          fullHousePayment: input.fullHousePayment,
          comments: input.comments,
          nameChange: input.nameChange,
          tenantId: ctx.user.tenantId,
        },
        include: {
          originalInstructor: {
            select: {
              id: true,
              name: true,
              fullName: true,
            },
          },
          replacementInstructor: {
            select: {
              id: true,
              name: true,
              fullName: true,
            },
          },
          class: {
            select: {
              id: true,
              date: true,
              studio: true,
              room: true,
              discipline: {
                select: {
                  name: true,
                  color: true,
                },
              },
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

      return cover;
    }),

  // Update cover (protected)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        replacementInstructorId: z.string().optional(),
        justification: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
        bonusPayment: z.boolean().optional(),
        fullHousePayment: z.boolean().optional(),
        comments: z.string().optional(),
        nameChange: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      const { id, ...updateData } = input;

      // Verify replacement instructor exists if being updated
      if (updateData.replacementInstructorId) {
        const replacementInstructor = await prisma.instructor.findUnique({
          where: { id: updateData.replacementInstructorId },
        });
        if (!replacementInstructor) {
          throw new Error("Replacement instructor not found");
        }
      }

      const cover = await prisma.cover.update({
        where: {
          id,
          tenantId: ctx.user.tenantId,
        },
        data: updateData,
        include: {
          originalInstructor: {
            select: {
              id: true,
              name: true,
              fullName: true,
            },
          },
          replacementInstructor: {
            select: {
              id: true,
              name: true,
              fullName: true,
            },
          },
          class: {
            select: {
              id: true,
              date: true,
              studio: true,
              room: true,
              discipline: {
                select: {
                  name: true,
                  color: true,
                },
              },
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

      return cover;
    }),

  // Delete cover (protected)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      await prisma.cover.delete({
        where: {
          id: input.id,
          tenantId: ctx.user.tenantId,
        },
      });

      return { success: true };
    }),

  // Get cover statistics (protected)
  getStats: protectedProcedure
    .input(z.object({ coverId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      const cover = await prisma.cover.findUnique({
        where: {
          id: input.coverId,
          tenantId: ctx.user.tenantId,
        },
        include: {
          originalInstructor: {
            select: {
              name: true,
              fullName: true,
            },
          },
          replacementInstructor: {
            select: {
              name: true,
              fullName: true,
            },
          },
          class: {
            select: {
              date: true,
              studio: true,
              room: true,
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

      if (!cover) {
        throw new Error("Cover not found");
      }

      return {
        cover,
        stats: {
          justification: cover.justification,
          bonusPayment: cover.bonusPayment,
          fullHousePayment: cover.fullHousePayment,
          createdAt: cover.createdAt,
        },
      };
    }),

  // Get covers by instructor (protected)
  getByInstructor: protectedProcedure
    .input(z.object({ instructorId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      const covers = await prisma.cover.findMany({
        where: {
          OR: [
            { originalInstructorId: input.instructorId },
            { replacementInstructorId: input.instructorId },
          ],
          tenantId: ctx.user.tenantId,
        },
        include: {
          originalInstructor: {
            select: {
              name: true,
              fullName: true,
            },
          },
          replacementInstructor: {
            select: {
              name: true,
              fullName: true,
            },
          },
          class: {
            select: {
              date: true,
              studio: true,
              room: true,
              discipline: {
                select: {
                  name: true,
                  color: true,
                },
              },
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
          createdAt: "desc",
        },
      });

      const asOriginal = covers.filter(
        (c: { originalInstructorId: string }) =>
          c.originalInstructorId === input.instructorId
      );
      const asReplacement = covers.filter(
        (c: { replacementInstructorId: string }) =>
          c.replacementInstructorId === input.instructorId
      );
      const confirmed = covers.filter(
        (c: { justification: string }) => c.justification === "APPROVED"
      );

      return {
        covers,
        stats: {
          total: covers.length,
          asOriginal: asOriginal.length,
          asReplacement: asReplacement.length,
          confirmed: confirmed.length,
        },
      };
    }),

  // Get covers by period (protected)
  getByPeriod: protectedProcedure
    .input(z.object({ periodId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      const covers = await prisma.cover.findMany({
        where: {
          periodId: input.periodId,
          tenantId: ctx.user.tenantId,
        },
        include: {
          originalInstructor: {
            select: {
              name: true,
              fullName: true,
            },
          },
          replacementInstructor: {
            select: {
              name: true,
              fullName: true,
            },
          },
          class: {
            select: {
              date: true,
              studio: true,
              room: true,
              discipline: {
                select: {
                  name: true,
                  color: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const confirmed = covers.filter(
        (c: { justification: string }) => c.justification === "APPROVED"
      );
      const uniqueInstructors = new Set([
        ...covers.map(
          (c: { originalInstructorId: string }) => c.originalInstructorId
        ),
        ...covers.map(
          (c: { replacementInstructorId: string }) => c.replacementInstructorId
        ),
      ]).size;

      return {
        covers,
        stats: {
          total: covers.length,
          confirmed: confirmed.length,
          uniqueInstructors,
        },
      };
    }),
});
