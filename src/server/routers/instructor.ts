import { z } from "zod";
import { prisma } from "../../lib/db";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const instructorRouter = router({
  // Get all instructors (public)
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
      if (!prisma) {
        throw new Error("Prisma client is not initialized");
      }

      if (!prisma.instructor) {
        throw new Error("Instructor model is not available in Prisma client");
      }

      const limit = input?.limit ?? 20;
      const offset = input?.offset ?? 0;

      const [instructors, total] = await Promise.all([
        prisma.instructor.findMany({
          where: {
            active: true,
          },
          select: {
            id: true,
            name: true,
            fullName: true,
            active: true,
            phone: true,
            DNI: true,
            bank: true,
            bankAccount: true,
            CCI: true,
            contactPerson: true,
            createdAt: true,
            updatedAt: true,
            // Include related data
            classes: {
              select: {
                id: true,
                date: true,
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
              orderBy: {
                date: "desc",
              },
              take: 5, // Last 5 classes
            },
            payments: {
              select: {
                id: true,
                amount: true,
                finalPayment: true,
                status: true,
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
              take: 3, // Last 3 payments
            },
            disciplines: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
          orderBy: {
            name: "asc",
          },
          take: limit,
          skip: offset,
        }),
        prisma.instructor.count({
          where: {
            active: true,
          },
        }),
      ]);

      return {
        instructors,
        total,
        hasMore: offset + limit < total,
      };
    }),

  // Get instructor by ID (public)
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const instructor = await prisma.instructor.findUnique({
        where: {
          id: input.id,
        },
        select: {
          id: true,
          name: true,
          fullName: true,
          active: true,
          phone: true,
          DNI: true,
          bank: true,
          bankAccount: true,
          CCI: true,
          contactPerson: true,
          extraInfo: true,
          lastBonus: true,
          createdAt: true,
          updatedAt: true,
          classes: {
            select: {
              id: true,
              date: true,
              totalReservations: true,
              paidReservations: true,
              spots: true,
              specialText: true,
              isVersus: true,
              versusNumber: true,
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
              date: "desc",
            },
          },
          payments: {
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
              comments: true,
              period: {
                select: {
                  number: true,
                  year: true,
                  startDate: true,
                  endDate: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
          disciplines: {
            select: {
              id: true,
              name: true,
              color: true,
              description: true,
            },
          },
          categories: {
            select: {
              id: true,
              category: true,
              isManual: true,
              metrics: true,
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
              createdAt: "desc",
            },
          },
        },
      });

      return instructor;
    }),

  // Get instructors with filters (protected)
  getWithFilters: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        discipline: z.string().optional(),
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
          fullName?: { contains: string; mode: "insensitive" };
          phone?: { contains: string; mode: "insensitive" };
          DNI?: { contains: string; mode: "insensitive" };
        }>;
        active?: boolean;
        disciplines?: {
          some: {
            id: string;
          };
        };
      } = {
        tenantId: ctx.user?.tenantId || undefined,
      };

      if (input.search) {
        where.OR = [
          { name: { contains: input.search, mode: "insensitive" } },
          { fullName: { contains: input.search, mode: "insensitive" } },
          { phone: { contains: input.search, mode: "insensitive" } },
          { DNI: { contains: input.search, mode: "insensitive" } },
        ];
      }

      if (input.discipline) {
        where.disciplines = {
          some: {
            id: input.discipline,
          },
        };
      }

      if (input.active !== undefined) {
        where.active = input.active;
      }

      const [instructors, total] = await Promise.all([
        prisma.instructor.findMany({
          where,
          select: {
            id: true,
            name: true,
            fullName: true,
            active: true,
            phone: true,
            DNI: true,
            createdAt: true,
            disciplines: {
              select: {
                name: true,
                color: true,
              },
            },
            _count: {
              select: {
                classes: true,
                payments: true,
              },
            },
          },
          orderBy: {
            name: "asc",
          },
          take: input.limit,
          skip: input.offset,
        }),
        prisma.instructor.count({ where }),
      ]);

      return {
        instructors,
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  // Create instructor (protected)
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        fullName: z.string().optional(),
        phone: z.string().optional(),
        DNI: z.string().optional(),
        bank: z.string().optional(),
        bankAccount: z.string().optional(),
        CCI: z.string().optional(),
        contactPerson: z.string().optional(),
        extraInfo: z.any().optional(),
        disciplineIds: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      const instructor = await prisma.instructor.create({
        data: {
          name: input.name,
          fullName: input.fullName,
          phone: input.phone,
          DNI: input.DNI,
          bank: input.bank,
          bankAccount: input.bankAccount,
          CCI: input.CCI,
          contactPerson: input.contactPerson,
          extraInfo: input.extraInfo,
          tenantId: ctx.user.tenantId,
          disciplines: input.disciplineIds
            ? {
                connect: input.disciplineIds.map((id) => ({ id })),
              }
            : undefined,
        },
        include: {
          disciplines: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      });

      return instructor;
    }),

  // Update instructor (protected)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        fullName: z.string().optional(),
        phone: z.string().optional(),
        DNI: z.string().optional(),
        bank: z.string().optional(),
        bankAccount: z.string().optional(),
        CCI: z.string().optional(),
        contactPerson: z.string().optional(),
        extraInfo: z.any().optional(),
        active: z.boolean().optional(),
        disciplineIds: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      const { id, disciplineIds, ...updateData } = input;

      const instructor = await prisma.instructor.update({
        where: {
          id,
          tenantId: ctx.user.tenantId,
        },
        data: {
          ...updateData,
          disciplines: disciplineIds
            ? {
                set: disciplineIds.map((disciplineId) => ({
                  id: disciplineId,
                })),
              }
            : undefined,
        },
        include: {
          disciplines: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      });

      return instructor;
    }),

  // Delete instructor (protected)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      await prisma.instructor.delete({
        where: {
          id: input.id,
          tenantId: ctx.user.tenantId,
        },
      });

      return { success: true };
    }),

  // Get instructor statistics (protected)
  getStats: protectedProcedure
    .input(z.object({ instructorId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      const instructor = await prisma.instructor.findUnique({
        where: {
          id: input.instructorId,
          tenantId: ctx.user.tenantId,
        },
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              classes: true,
              payments: true,
              coversAsOriginal: true,
              coversAsReplacement: true,
              penalties: true,
              brandings: true,
              themeRides: true,
              workshops: true,
            },
          },
        },
      });

      if (!instructor) {
        throw new Error("Instructor not found");
      }

      // Get recent performance metrics
      const recentClasses = await prisma.class.findMany({
        where: {
          instructorId: input.instructorId,
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
        take: 10,
      });

      const avgOccupation =
        recentClasses.length > 0
          ? recentClasses.reduce(
              (sum, cls) => sum + cls.paidReservations / cls.spots,
              0
            ) / recentClasses.length
          : 0;

      return {
        instructor,
        stats: {
          totalClasses: instructor._count.classes,
          totalPayments: instructor._count.payments,
          coversAsOriginal: instructor._count.coversAsOriginal,
          coversAsReplacement: instructor._count.coversAsReplacement,
          penalties: instructor._count.penalties,
          brandings: instructor._count.brandings,
          themeRides: instructor._count.themeRides,
          workshops: instructor._count.workshops,
          avgOccupation: Math.round(avgOccupation * 100) / 100,
        },
      };
    }),

  // Login instructor (public)
  login: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        password: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      // Find instructor by name
      const instructor = await prisma.instructor.findFirst({
        where: {
          name: {
            contains: input.name,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
          name: true,
          fullName: true,
          phone: true,
          DNI: true,
          active: true,
        },
      });

      if (!instructor) {
        throw new Error("Instructor not found");
      }

      if (!instructor.active) {
        throw new Error("Instructor account is inactive");
      }

      // Simple password validation (in production, use proper hashing)
      // For demo purposes, we'll use a simple pattern
      const expectedPassword = `${instructor.name.toLowerCase().replace(/\s+/g, "")}123`;

      if (input.password !== expectedPassword) {
        throw new Error("Invalid password");
      }

      // Generate a simple token (in production, use JWT)
      const token = Buffer.from(`${instructor.id}:${Date.now()}`).toString(
        "base64"
      );

      return {
        token,
        instructor,
      };
    }),
});
