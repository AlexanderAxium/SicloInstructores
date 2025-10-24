import { z } from "zod";
import { prisma } from "../../lib/db";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const periodsRouter = router({
  // Get all periods (public)
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

      const [periods, total] = await Promise.all([
        prisma.period.findMany({
          orderBy: [{ startDate: "desc" }, { number: "desc" }],
          take: limit,
          skip: offset,
        }),
        prisma.period.count(),
      ]);

      return {
        periods,
        total,
        hasMore: offset + limit < total,
      };
    }),

  // Get period by ID (public)
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const period = await prisma.period.findUnique({
        where: {
          id: input.id,
        },
        include: {
          classes: {
            select: {
              id: true,
              date: true,
              studio: true,
              room: true,
              totalReservations: true,
              paidReservations: true,
              spots: true,
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
            orderBy: {
              date: "desc",
            },
            take: 10, // Last 10 classes
          },
          payments: {
            select: {
              id: true,
              amount: true,
              finalPayment: true,
              status: true,
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
            take: 10, // Last 10 payments
          },
          _count: {
            select: {
              classes: true,
              payments: true,
            },
          },
        },
      });

      return period;
    }),

  // Get periods with filters (protected)
  getWithFilters: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        year: z.number().optional(),
        number: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        bonusCalculated: z.boolean().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const where: {
        tenantId?: string;
        OR?: Array<{
          number?: { equals: number };
          year?: { equals: number };
        }>;
        year?: number;
        number?: number;
        startDate?: { gte?: Date; lte?: Date };
        endDate?: { lte: Date };
        bonusCalculated?: boolean;
      } = {
        tenantId: ctx.user?.tenantId || undefined,
      };

      if (input.search) {
        const searchNumber = Number.parseInt(input.search);
        const searchYear = Number.parseInt(input.search);

        where.OR = [];
        if (!Number.isNaN(searchNumber)) {
          where.OR.push({ number: { equals: searchNumber } });
        }
        if (!Number.isNaN(searchYear)) {
          where.OR.push({ year: { equals: searchYear } });
        }
      }

      if (input.year !== undefined) {
        where.year = input.year;
      }

      if (input.number !== undefined) {
        where.number = input.number;
      }

      if (input.startDate || input.endDate) {
        where.startDate = {};
        if (input.startDate) {
          where.startDate.gte = new Date(input.startDate);
        }
        if (input.endDate) {
          where.endDate = { lte: new Date(input.endDate) };
        }
      }

      if (input.bonusCalculated !== undefined) {
        where.bonusCalculated = input.bonusCalculated;
      }

      const [periods, total] = await Promise.all([
        prisma.period.findMany({
          where,
          include: {
            _count: {
              select: {
                classes: true,
                payments: true,
              },
            },
          },
          orderBy: [{ startDate: "desc" }, { number: "desc" }],
          take: input.limit,
          skip: input.offset,
        }),
        prisma.period.count({ where }),
      ]);

      return {
        periods,
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  // Create period (protected)
  create: protectedProcedure
    .input(
      z.object({
        number: z.number().min(1),
        year: z.number().min(2000).max(3000),
        startDate: z.string(),
        endDate: z.string(),
        paymentDate: z.string(),
        bonusCalculated: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      // Check if period with same number and year already exists
      const existingPeriod = await prisma.period.findFirst({
        where: {
          number: input.number,
          year: input.year,
          tenantId: ctx.user.tenantId,
        },
      });

      if (existingPeriod) {
        throw new Error("A period with this number and year already exists");
      }

      // Validate date ranges
      const startDate = new Date(input.startDate);
      const endDate = new Date(input.endDate);
      const paymentDate = new Date(input.paymentDate);

      if (startDate >= endDate) {
        throw new Error("Start date must be before end date");
      }

      if (paymentDate < endDate) {
        throw new Error("Payment date must be after or equal to end date");
      }

      const period = await prisma.period.create({
        data: {
          number: input.number,
          year: input.year,
          startDate,
          endDate,
          paymentDate,
          bonusCalculated: input.bonusCalculated,
          tenantId: ctx.user.tenantId,
        },
      });

      return period;
    }),

  // Update period (protected)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        number: z.number().optional(),
        year: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        paymentDate: z.string().optional(),
        bonusCalculated: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      const { id, ...updateData } = input;

      // Check if number and year combination conflicts with existing period
      if (updateData.number !== undefined || updateData.year !== undefined) {
        const currentPeriod = await prisma.period.findUnique({
          where: { id },
          select: { number: true, year: true },
        });

        const number = updateData.number ?? currentPeriod?.number;
        const year = updateData.year ?? currentPeriod?.year;

        if (number && year) {
          const existingPeriod = await prisma.period.findFirst({
            where: {
              number,
              year,
              tenantId: ctx.user.tenantId,
              NOT: { id },
            },
          });

          if (existingPeriod) {
            throw new Error(
              "A period with this number and year already exists"
            );
          }
        }
      }

      // Validate date ranges if dates are being updated
      if (
        updateData.startDate ||
        updateData.endDate ||
        updateData.paymentDate
      ) {
        const currentPeriod = await prisma.period.findUnique({
          where: { id },
          select: { startDate: true, endDate: true, paymentDate: true },
        });

        const startDate = updateData.startDate
          ? new Date(updateData.startDate)
          : currentPeriod?.startDate;
        const endDate = updateData.endDate
          ? new Date(updateData.endDate)
          : currentPeriod?.endDate;
        const paymentDate = updateData.paymentDate
          ? new Date(updateData.paymentDate)
          : currentPeriod?.paymentDate;

        if (startDate && endDate && startDate >= endDate) {
          throw new Error("Start date must be before end date");
        }

        if (endDate && paymentDate && paymentDate < endDate) {
          throw new Error("Payment date must be after or equal to end date");
        }
      }

      // Convert date strings to Date objects
      const { startDate, endDate, paymentDate, ...restData } = updateData;
      const processedUpdateData = {
        ...restData,
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(paymentDate && { paymentDate: new Date(paymentDate) }),
      };

      const period = await prisma.period.update({
        where: {
          id,
          tenantId: ctx.user.tenantId,
        },
        data: processedUpdateData,
      });

      return period;
    }),

  // Delete period (protected)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      // Check if period has related data
      const period = await prisma.period.findUnique({
        where: { id: input.id },
        include: {
          _count: {
            select: {
              classes: true,
              payments: true,
            },
          },
        },
      });

      if (!period) {
        throw new Error("Period not found");
      }

      if (period._count.classes > 0 || period._count.payments > 0) {
        throw new Error(
          "Cannot delete period with associated classes or payments"
        );
      }

      await prisma.period.delete({
        where: {
          id: input.id,
          tenantId: ctx.user.tenantId,
        },
      });

      return { success: true };
    }),

  // Get period statistics (protected)
  getStats: protectedProcedure
    .input(z.object({ periodId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      const period = await prisma.period.findUnique({
        where: {
          id: input.periodId,
          tenantId: ctx.user.tenantId,
        },
        include: {
          _count: {
            select: {
              classes: true,
              payments: true,
            },
          },
        },
      });

      if (!period) {
        throw new Error("Period not found");
      }

      // Get financial summary
      const payments = await prisma.instructorPayment.findMany({
        where: {
          periodId: input.periodId,
          tenantId: ctx.user.tenantId,
        },
        select: {
          amount: true,
          finalPayment: true,
          status: true,
        },
      });

      const totalAmount = payments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      );
      const totalFinalPayment = payments.reduce(
        (sum, payment) => sum + payment.finalPayment,
        0
      );
      const paidPayments = payments.filter((p) => p.status === "PAID");
      const totalPaid = paidPayments.reduce(
        (sum, payment) => sum + payment.finalPayment,
        0
      );

      // Get class statistics
      const classes = await prisma.class.findMany({
        where: {
          periodId: input.periodId,
          tenantId: ctx.user.tenantId,
        },
        select: {
          totalReservations: true,
          paidReservations: true,
          spots: true,
        },
      });

      const totalReservations = classes.reduce(
        (sum, cls) => sum + cls.totalReservations,
        0
      );
      const totalPaidReservations = classes.reduce(
        (sum, cls) => sum + cls.paidReservations,
        0
      );
      const totalSpots = classes.reduce((sum, cls) => sum + cls.spots, 0);
      const avgOccupation =
        totalSpots > 0 ? (totalPaidReservations / totalSpots) * 100 : 0;

      return {
        period,
        stats: {
          totalClasses: period._count.classes,
          totalPayments: period._count.payments,
          totalAmount,
          totalFinalPayment,
          totalPaid,
          totalReservations,
          totalPaidReservations,
          totalSpots,
          avgOccupation: Math.round(avgOccupation * 100) / 100,
          paymentStatus: {
            total: payments.length,
            paid: paidPayments.length,
            pending: payments.filter((p) => p.status === "PENDING").length,
            approved: payments.filter((p) => p.status === "APPROVED").length,
            cancelled: payments.filter((p) => p.status === "CANCELLED").length,
          },
        },
      };
    }),
});
