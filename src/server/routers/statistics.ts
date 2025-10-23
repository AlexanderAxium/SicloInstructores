import { z } from "zod";
import { prisma } from "../../lib/db";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const statisticsRouter = router({
  // Get general statistics (public)
  getGeneral: publicProcedure.query(async () => {
    const [
      totalInstructors,
      totalClasses,
      totalPayments,
      totalPeriods,
      totalDisciplines,
    ] = await Promise.all([
      prisma.instructor.count({ where: { active: true } }),
      prisma.class.count(),
      prisma.instructorPayment.count(),
      prisma.period.count(),
      prisma.discipline.count({ where: { active: true } }),
    ]);

    return {
      totalInstructors,
      totalClasses,
      totalPayments,
      totalPeriods,
      totalDisciplines,
    };
  }),

  // Get period statistics (protected)
  getPeriodStats: protectedProcedure
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
      });

      if (!period) {
        throw new Error("Period not found");
      }

      const [
        classes,
        payments,
        instructors,
        disciplines,
        workshops,
        themeRides,
        covers,
        penalties,
      ] = await Promise.all([
        prisma.class.findMany({
          where: { periodId: input.periodId, tenantId: ctx.user.tenantId },
          select: {
            totalReservations: true,
            paidReservations: true,
            spots: true,
            date: true,
          },
        }),
        prisma.instructorPayment.findMany({
          where: { periodId: input.periodId, tenantId: ctx.user.tenantId },
          select: {
            amount: true,
            finalPayment: true,
            status: true,
          },
        }),
        prisma.instructor.findMany({
          where: {
            classes: { some: { periodId: input.periodId } },
            tenantId: ctx.user.tenantId,
          },
          select: { id: true },
        }),
        prisma.discipline.findMany({
          where: {
            classes: { some: { periodId: input.periodId } },
            tenantId: ctx.user.tenantId,
          },
          select: { id: true },
        }),
        prisma.workshop.findMany({
          where: { periodId: input.periodId, tenantId: ctx.user.tenantId },
          select: { payment: true },
        }),
        prisma.themeRide.findMany({
          where: { periodId: input.periodId, tenantId: ctx.user.tenantId },
          select: { id: true },
        }),
        prisma.cover.findMany({
          where: { periodId: input.periodId, tenantId: ctx.user.tenantId },
          select: { justification: true },
        }),
        prisma.penalty.findMany({
          where: { periodId: input.periodId, tenantId: ctx.user.tenantId },
          select: { points: true, active: true },
        }),
      ]);

      const totalReservations = classes.reduce(
        (
          sum: number,
          cls: {
            totalReservations: number;
            paidReservations: number;
            spots: number;
            date?: Date;
            discipline?: { name: string };
            instructor?: { name: string };
            studio?: string;
          }
        ) => sum + cls.totalReservations,
        0
      );
      const totalPaidReservations = classes.reduce(
        (
          sum: number,
          cls: {
            totalReservations: number;
            paidReservations: number;
            spots: number;
            date?: Date;
            discipline?: { name: string };
            instructor?: { name: string };
            studio?: string;
          }
        ) => sum + cls.paidReservations,
        0
      );
      const totalSpots = classes.reduce(
        (
          sum: number,
          cls: {
            totalReservations: number;
            paidReservations: number;
            spots: number;
            date?: Date;
            discipline?: { name: string };
            instructor?: { name: string };
            studio?: string;
          }
        ) => sum + cls.spots,
        0
      );
      const avgOccupation =
        totalSpots > 0 ? (totalPaidReservations / totalSpots) * 100 : 0;

      const totalAmount = payments.reduce(
        (sum: number, payment) => sum + (payment.amount || 0),
        0
      );
      const totalFinalPayment = payments.reduce(
        (sum: number, payment) => sum + (payment.finalPayment || 0),
        0
      );
      const paidPayments = payments.filter(
        (p: { status: string }) => p.status === "PAID"
      );
      const totalPaid = paidPayments.reduce(
        (sum: number, payment) => sum + (payment.finalPayment || 0),
        0
      );

      const totalWorkshopPayment = workshops.reduce(
        (sum: number, workshop: { payment: number }) => sum + workshop.payment,
        0
      );
      const confirmedCovers = covers.filter(
        (c: {
          justification: string;
          originalInstructorId?: string;
          replacementInstructorId?: string;
          createdAt?: Date;
        }) => c.justification === "APPROVED"
      ).length;
      const totalPenaltyPoints = penalties.reduce(
        (
          sum: number,
          penalty: {
            points: number;
            active?: boolean;
            type?: string;
          }
        ) => sum + penalty.points,
        0
      );
      const activePenalties = penalties.filter(
        (p: { active: boolean }) => p.active
      ).length;

      return {
        period,
        stats: {
          classes: {
            total: classes.length,
            totalReservations,
            totalPaidReservations,
            totalSpots,
            avgOccupation: Math.round(avgOccupation * 100) / 100,
          },
          payments: {
            total: payments.length,
            totalAmount,
            totalFinalPayment,
            totalPaid,
            paid: paidPayments.length,
            pending: payments.filter(
              (p: { status: string }) => p.status === "PENDING"
            ).length,
            approved: payments.filter(
              (p: { status: string }) => p.status === "APPROVED"
            ).length,
            cancelled: payments.filter(
              (p: { status: string }) => p.status === "CANCELLED"
            ).length,
          },
          instructors: {
            total: instructors.length,
          },
          disciplines: {
            total: disciplines.length,
          },
          workshops: {
            total: workshops.length,
            totalPayment: totalWorkshopPayment,
          },
          themeRides: {
            total: themeRides.length,
          },
          covers: {
            total: covers.length,
            confirmed: confirmedCovers,
          },
          penalties: {
            total: penalties.length,
            active: activePenalties,
            totalPoints: totalPenaltyPoints,
          },
        },
      };
    }),

  // Get instructor statistics (protected)
  getInstructorStats: protectedProcedure
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
      });

      if (!instructor) {
        throw new Error("Instructor not found");
      }

      const [classes, payments, workshops, themeRides, covers, penalties] =
        await Promise.all([
          prisma.class.findMany({
            where: {
              instructorId: input.instructorId,
              tenantId: ctx.user.tenantId,
            },
            select: {
              totalReservations: true,
              paidReservations: true,
              spots: true,
              date: true,
              discipline: { select: { name: true } },
            },
          }),
          prisma.instructorPayment.findMany({
            where: {
              instructorId: input.instructorId,
              tenantId: ctx.user.tenantId,
            },
            select: {
              amount: true,
              finalPayment: true,
              status: true,
              period: { select: { number: true, year: true } },
            },
          }),
          prisma.workshop.findMany({
            where: {
              instructorId: input.instructorId,
              tenantId: ctx.user.tenantId,
            },
            select: { payment: true, date: true },
          }),
          prisma.themeRide.findMany({
            where: {
              instructorId: input.instructorId,
              tenantId: ctx.user.tenantId,
            },
            select: { number: true, createdAt: true },
          }),
          prisma.cover.findMany({
            where: {
              OR: [
                { originalInstructorId: input.instructorId },
                { replacementInstructorId: input.instructorId },
              ],
              tenantId: ctx.user.tenantId,
            },
            select: { justification: true, createdAt: true },
          }),
          prisma.penalty.findMany({
            where: {
              instructorId: input.instructorId,
              tenantId: ctx.user.tenantId,
            },
            select: { points: true, active: true, type: true },
          }),
        ]);

      const totalReservations = classes.reduce(
        (
          sum: number,
          cls: {
            totalReservations: number;
            paidReservations: number;
            spots: number;
            date?: Date;
            discipline?: { name: string };
            instructor?: { name: string };
            studio?: string;
          }
        ) => sum + cls.totalReservations,
        0
      );
      const totalPaidReservations = classes.reduce(
        (
          sum: number,
          cls: {
            totalReservations: number;
            paidReservations: number;
            spots: number;
            date?: Date;
            discipline?: { name: string };
            instructor?: { name: string };
            studio?: string;
          }
        ) => sum + cls.paidReservations,
        0
      );
      const totalSpots = classes.reduce(
        (
          sum: number,
          cls: {
            totalReservations: number;
            paidReservations: number;
            spots: number;
            date?: Date;
            discipline?: { name: string };
            instructor?: { name: string };
            studio?: string;
          }
        ) => sum + cls.spots,
        0
      );
      const avgOccupation =
        totalSpots > 0 ? (totalPaidReservations / totalSpots) * 100 : 0;

      const totalAmount = payments.reduce(
        (sum: number, payment) => sum + (payment.amount || 0),
        0
      );
      const totalFinalPayment = payments.reduce(
        (sum: number, payment) => sum + (payment.finalPayment || 0),
        0
      );
      const paidPayments = payments.filter(
        (p: { status: string }) => p.status === "PAID"
      );
      const totalPaid = paidPayments.reduce(
        (sum: number, payment) => sum + (payment.finalPayment || 0),
        0
      );

      const totalWorkshopPayment = workshops.reduce(
        (sum: number, workshop: { payment: number }) => sum + workshop.payment,
        0
      );
      const asOriginalCover = covers.filter(
        (c: {
          justification: string;
          originalInstructorId?: string;
          replacementInstructorId?: string;
          createdAt?: Date;
        }) => c.originalInstructorId === input.instructorId
      ).length;
      const asReplacementCover = covers.filter(
        (c: {
          justification: string;
          originalInstructorId?: string;
          replacementInstructorId?: string;
          createdAt?: Date;
        }) => c.replacementInstructorId === input.instructorId
      ).length;
      const confirmedCovers = covers.filter(
        (c: {
          justification: string;
          originalInstructorId?: string;
          replacementInstructorId?: string;
          createdAt?: Date;
        }) => c.justification === "APPROVED"
      ).length;

      const totalPenaltyPoints = penalties.reduce(
        (
          sum: number,
          penalty: {
            points: number;
            active?: boolean;
            type?: string;
          }
        ) => sum + penalty.points,
        0
      );
      const activePenalties = penalties.filter(
        (p: { active: boolean }) => p.active
      ).length;

      // Get discipline breakdown
      const disciplineStats = classes.reduce(
        (
          acc: Record<string, number>,
          cls: {
            totalReservations: number;
            paidReservations: number;
            spots: number;
            date?: Date;
            discipline?: { name: string };
            instructor?: { name: string };
            studio?: string;
          }
        ) => {
          const discipline = cls.discipline?.name || "Unknown";
          acc[discipline] = (acc[discipline] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      return {
        instructor,
        stats: {
          classes: {
            total: classes.length,
            totalReservations,
            totalPaidReservations,
            totalSpots,
            avgOccupation: Math.round(avgOccupation * 100) / 100,
            byDiscipline: disciplineStats,
          },
          payments: {
            total: payments.length,
            totalAmount,
            totalFinalPayment,
            totalPaid,
            paid: paidPayments.length,
          },
          workshops: {
            total: workshops.length,
            totalPayment: totalWorkshopPayment,
          },
          themeRides: {
            total: themeRides.length,
          },
          covers: {
            asOriginal: asOriginalCover,
            asReplacement: asReplacementCover,
            confirmed: confirmedCovers,
          },
          penalties: {
            total: penalties.length,
            active: activePenalties,
            totalPoints: totalPenaltyPoints,
          },
        },
      };
    }),

  // Get discipline statistics (protected)
  getDisciplineStats: protectedProcedure
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
      });

      if (!discipline) {
        throw new Error("Discipline not found");
      }

      const [classes, instructors] = await Promise.all([
        prisma.class.findMany({
          where: {
            disciplineId: input.disciplineId,
            tenantId: ctx.user.tenantId,
          },
          select: {
            totalReservations: true,
            paidReservations: true,
            spots: true,
            date: true,
            instructor: { select: { name: true } },
          },
        }),
        prisma.instructor.findMany({
          where: {
            disciplines: { some: { id: input.disciplineId } },
            tenantId: ctx.user.tenantId,
          },
          select: { id: true, name: true },
        }),
      ]);

      const totalReservations = classes.reduce(
        (
          sum: number,
          cls: {
            totalReservations: number;
            paidReservations: number;
            spots: number;
            date?: Date;
            discipline?: { name: string };
            instructor?: { name: string };
            studio?: string;
          }
        ) => sum + cls.totalReservations,
        0
      );
      const totalPaidReservations = classes.reduce(
        (
          sum: number,
          cls: {
            totalReservations: number;
            paidReservations: number;
            spots: number;
            date?: Date;
            discipline?: { name: string };
            instructor?: { name: string };
            studio?: string;
          }
        ) => sum + cls.paidReservations,
        0
      );
      const totalSpots = classes.reduce(
        (
          sum: number,
          cls: {
            totalReservations: number;
            paidReservations: number;
            spots: number;
            date?: Date;
            discipline?: { name: string };
            instructor?: { name: string };
            studio?: string;
          }
        ) => sum + cls.spots,
        0
      );
      const avgOccupation =
        totalSpots > 0 ? (totalPaidReservations / totalSpots) * 100 : 0;

      // Get instructor breakdown
      const instructorStats = classes.reduce(
        (
          acc: Record<string, number>,
          cls: {
            totalReservations: number;
            paidReservations: number;
            spots: number;
            date?: Date;
            discipline?: { name: string };
            instructor?: { name: string };
            studio?: string;
          }
        ) => {
          const instructor = cls.instructor?.name || "Unknown";
          acc[instructor] = (acc[instructor] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      return {
        discipline,
        stats: {
          classes: {
            total: classes.length,
            totalReservations,
            totalPaidReservations,
            totalSpots,
            avgOccupation: Math.round(avgOccupation * 100) / 100,
            byInstructor: instructorStats,
          },
          instructors: {
            total: instructors.length,
            list: instructors,
          },
        },
      };
    }),

  // Get venue statistics (protected)
  getVenueStats: protectedProcedure
    .input(
      z.object({
        periodId: z.string().optional(),
        periodStart: z.string().optional(),
        periodEnd: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      const where: Record<string, any> = {
        tenantId: ctx.user.tenantId,
      };

      // Handle period filtering
      if (input.periodId) {
        where.periodId = input.periodId;
      } else if (input.periodStart || input.periodEnd) {
        const periodFilter: Record<string, number> = {};
        if (input.periodStart) {
          periodFilter.gte = Number.parseInt(input.periodStart);
        }
        if (input.periodEnd) {
          periodFilter.lte = Number.parseInt(input.periodEnd);
        }
        where.periodId = periodFilter;
      }

      const classes = await prisma.class.findMany({
        where,
        select: {
          studio: true,
          totalReservations: true,
          paidReservations: true,
          spots: true,
          discipline: { select: { name: true } },
        },
      });

      // Group by venue
      const venueStats = classes.reduce(
        (
          acc: Record<string, any>,
          cls: {
            totalReservations: number;
            paidReservations: number;
            spots: number;
            date?: Date;
            discipline?: { name: string };
            instructor?: { name: string };
            studio?: string;
          }
        ) => {
          const venue = cls.studio || "Unknown";
          if (!acc[venue]) {
            acc[venue] = {
              totalClasses: 0,
              totalReservations: 0,
              totalPaidReservations: 0,
              totalSpots: 0,
              disciplines: new Set(),
            };
          }
          acc[venue].totalClasses++;
          acc[venue].totalReservations += cls.totalReservations;
          acc[venue].totalPaidReservations += cls.paidReservations;
          acc[venue].totalSpots += cls.spots;
          acc[venue].disciplines.add(cls.discipline?.name || "Unknown");
          return acc;
        },
        {} as Record<string, any>
      );

      // Calculate occupation rates
      Object.keys(venueStats).forEach((venue) => {
        const stats = venueStats[venue];
        stats.avgOccupation =
          stats.totalSpots > 0
            ? (stats.totalPaidReservations / stats.totalSpots) * 100
            : 0;
        stats.disciplines = Array.from(stats.disciplines);
      });

      return {
        venues: Object.keys(venueStats).map((venue) => ({
          venue,
          ...venueStats[venue],
          avgOccupation:
            Math.round(venueStats[venue].avgOccupation * 100) / 100,
        })),
        total: Object.keys(venueStats).length,
      };
    }),

  // Get financial summary (protected)
  getFinancialSummary: protectedProcedure
    .input(
      z.object({
        periodId: z.string().optional(),
        periodStart: z.string().optional(),
        periodEnd: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      const where: Record<string, any> = {
        tenantId: ctx.user.tenantId,
      };

      // Handle period filtering
      if (input.periodId) {
        where.periodId = input.periodId;
      } else if (input.periodStart || input.periodEnd) {
        const periodFilter: Record<string, number> = {};
        if (input.periodStart) {
          periodFilter.gte = Number.parseInt(input.periodStart);
        }
        if (input.periodEnd) {
          periodFilter.lte = Number.parseInt(input.periodEnd);
        }
        where.periodId = periodFilter;
      }

      const [payments, workshops] = await Promise.all([
        prisma.instructorPayment.findMany({
          where,
          select: {
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
          },
        }),
        prisma.workshop.findMany({
          where,
          select: { payment: true },
        }),
      ]);

      const totalAmount = payments.reduce(
        (sum: number, payment) => sum + (payment.amount || 0),
        0
      );
      const totalFinalPayment = payments.reduce(
        (sum: number, payment) => sum + (payment.finalPayment || 0),
        0
      );
      const totalRetention = payments.reduce(
        (sum: number, payment) => sum + (payment.retention || 0),
        0
      );
      const totalAdjustment = payments.reduce(
        (sum: number, payment) => sum + (payment.adjustment || 0),
        0
      );
      const totalPenalty = payments.reduce(
        (sum: number, payment) => sum + (payment.penalty || 0),
        0
      );
      const totalCover = payments.reduce(
        (sum: number, payment) => sum + (payment.cover || 0),
        0
      );
      const totalBranding = payments.reduce(
        (sum: number, payment) => sum + (payment.branding || 0),
        0
      );
      const totalThemeRide = payments.reduce(
        (sum: number, payment) => sum + (payment.themeRide || 0),
        0
      );
      const totalWorkshop = payments.reduce(
        (sum: number, payment) => sum + (payment.workshop || 0),
        0
      );
      const totalVersusBonus = payments.reduce(
        (sum: number, payment) => sum + (payment.versusBonus || 0),
        0
      );
      const totalBonus = payments.reduce(
        (sum: number, payment) => sum + (payment.bonus || 0),
        0
      );

      const totalWorkshopPayment = workshops.reduce(
        (sum: number, workshop: { payment: number }) => sum + workshop.payment,
        0
      );

      const paidPayments = payments.filter(
        (p: { status: string }) => p.status === "PAID"
      );
      const totalPaid = paidPayments.reduce(
        (sum: number, payment) => sum + (payment.finalPayment || 0),
        0
      );

      return {
        summary: {
          totalAmount,
          totalFinalPayment,
          totalPaid,
          totalRetention,
          totalAdjustment,
          totalPenalty,
          totalCover,
          totalBranding,
          totalThemeRide,
          totalWorkshop,
          totalVersusBonus,
          totalBonus,
          totalWorkshopPayment,
        },
        breakdown: {
          deductions: {
            retention: totalRetention,
            penalty: totalPenalty,
            total: (totalRetention || 0) + (totalPenalty || 0),
          },
          bonuses: {
            adjustment: totalAdjustment,
            cover: totalCover,
            branding: totalBranding,
            themeRide: totalThemeRide,
            workshop: totalWorkshop,
            versusBonus: totalVersusBonus,
            bonus: totalBonus,
            total:
              (totalAdjustment || 0) +
              (totalCover || 0) +
              (totalBranding || 0) +
              (totalThemeRide || 0) +
              (totalWorkshop || 0) +
              (totalVersusBonus || 0) +
              (totalBonus || 0),
          },
        },
        status: {
          total: payments.length,
          paid: paidPayments.length,
          pending: payments.filter(
            (p: { status: string }) => p.status === "PENDING"
          ).length,
          approved: payments.filter(
            (p: { status: string }) => p.status === "APPROVED"
          ).length,
          cancelled: payments.filter(
            (p: { status: string }) => p.status === "CANCELLED"
          ).length,
        },
      };
    }),
});
