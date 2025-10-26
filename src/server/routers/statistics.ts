import { z } from "zod";
import { prisma } from "../../lib/db";
import { publicProcedure, router } from "../trpc";

export const statisticsRouter = router({
  // Get general statistics
  getGeneral: publicProcedure
    .input(
      z.object({
        periodId: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { user } = ctx;
      if (!user?.tenantId) {
        throw new Error("User not authenticated or tenant not found");
      }

      const periodFilter = input.periodId ? { periodId: input.periodId } : {};

      // Instructors statistics
      const totalInstructors = await prisma.instructor.count({
        where: { tenantId: user.tenantId },
      });

      const activeInstructors = await prisma.instructor.count({
        where: { tenantId: user.tenantId, active: true },
      });

      const instructorsWithDisciplines = await prisma.instructor.count({
        where: {
          tenantId: user.tenantId,
          disciplines: { some: {} },
        },
      });

      // Get instructors created in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const newInstructors = await prisma.instructor.count({
        where: {
          tenantId: user.tenantId,
          createdAt: { gte: thirtyDaysAgo },
        },
      });

      // Disciplines statistics
      const totalDisciplines = await prisma.discipline.count({
        where: { tenantId: user.tenantId },
      });

      const activeDisciplines = await prisma.discipline.count({
        where: { tenantId: user.tenantId, active: true },
      });

      // Classes statistics
      const classesWhere = {
        tenantId: user.tenantId,
        ...periodFilter,
      };

      const totalClasses = await prisma.class.count({
        where: classesWhere,
      });

      const classes = await prisma.class.findMany({
        where: classesWhere,
        select: {
          totalReservations: true,
          spots: true,
        },
      });

      const totalReservations = classes.reduce(
        (sum, c) => sum + c.totalReservations,
        0
      );
      const totalCapacity = classes.reduce((sum, c) => sum + c.spots, 0);
      const averageOccupation =
        totalCapacity > 0
          ? Math.round((totalReservations / totalCapacity) * 100)
          : 0;

      const fullClasses = classes.filter(
        (c) => c.totalReservations >= c.spots
      ).length;
      const percentageFullClasses =
        totalClasses > 0 ? (fullClasses / totalClasses) * 100 : 0;

      // Payments statistics
      const paymentsWhere = {
        tenantId: user.tenantId,
        ...periodFilter,
      };

      const totalPayments = await prisma.instructorPayment.count({
        where: paymentsWhere,
      });

      const pendingPayments = await prisma.instructorPayment.count({
        where: { ...paymentsWhere, status: "PENDING" },
      });

      const paidPayments = await prisma.instructorPayment.count({
        where: { ...paymentsWhere, status: "PAID" },
      });

      const paymentAggregates = await prisma.instructorPayment.aggregate({
        where: paymentsWhere,
        _sum: {
          finalPayment: true,
        },
      });

      const paidPaymentAggregates = await prisma.instructorPayment.aggregate({
        where: { ...paymentsWhere, status: "PAID" },
        _sum: {
          finalPayment: true,
        },
      });

      const totalAmount = paymentAggregates._sum.finalPayment || 0;
      const paidAmount = paidPaymentAggregates._sum.finalPayment || 0;
      const pendingAmount = totalAmount - paidAmount;
      const averagePayment =
        totalPayments > 0 ? totalAmount / totalPayments : 0;
      const percentagePaid =
        totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;
      const percentagePending = 100 - percentagePaid;

      return {
        instructors: {
          total: totalInstructors,
          active: activeInstructors,
          inactive: totalInstructors - activeInstructors,
          withDisciplines: instructorsWithDisciplines,
          withoutDisciplines: totalInstructors - instructorsWithDisciplines,
          new: newInstructors,
        },
        disciplines: {
          total: totalDisciplines,
          active: activeDisciplines,
          inactive: totalDisciplines - activeDisciplines,
        },
        classes: {
          total: totalClasses,
          averageOccupation: averageOccupation,
          fullClasses: fullClasses,
          percentageFullClasses: Math.round(percentageFullClasses),
          totalReservations: totalReservations,
        },
        payments: {
          total: totalPayments,
          pending: pendingPayments,
          paid: paidPayments,
          totalAmount: totalAmount,
          paidAmount: paidAmount,
          pendingAmount: pendingAmount,
          averageAmount: averagePayment,
          percentagePaid: Math.round(percentagePaid),
          percentagePending: Math.round(percentagePending),
        },
      };
    }),

  // Get instructor statistics
  getInstructors: publicProcedure
    .input(
      z.object({
        periodId: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { user } = ctx;
      if (!user?.tenantId) {
        throw new Error("User not authenticated or tenant not found");
      }

      const periodFilter = input.periodId ? { periodId: input.periodId } : {};

      // Top instructors by earnings
      const payments = await prisma.instructorPayment.findMany({
        where: {
          tenantId: user.tenantId,
          ...periodFilter,
        },
        select: {
          instructorId: true,
          finalPayment: true,
          instructor: {
            select: {
              name: true,
            },
          },
        },
      });

      // Get classes for occupation calculation
      const classes = await prisma.class.findMany({
        where: {
          tenantId: user.tenantId,
          ...periodFilter,
        },
        select: {
          instructorId: true,
          totalReservations: true,
          spots: true,
        },
      });

      // Aggregate by instructor
      const instructorMap = new Map<
        string,
        {
          id: string;
          name: string;
          earnings: number;
          classes: number;
          reservations: number;
          totalCapacity: number;
        }
      >();

      payments.forEach((payment) => {
        const existing = instructorMap.get(payment.instructorId);
        if (existing) {
          existing.earnings += payment.finalPayment;
        } else {
          instructorMap.set(payment.instructorId, {
            id: payment.instructorId,
            name: payment.instructor.name,
            earnings: payment.finalPayment,
            classes: 0,
            reservations: 0,
            totalCapacity: 0,
          });
        }
      });

      classes.forEach((clase) => {
        const existing = instructorMap.get(clase.instructorId);
        if (existing) {
          existing.classes += 1;
          existing.reservations += clase.totalReservations;
          existing.totalCapacity += clase.spots;
        } else {
          instructorMap.set(clase.instructorId, {
            id: clase.instructorId,
            name: "",
            earnings: 0,
            classes: 1,
            reservations: clase.totalReservations,
            totalCapacity: clase.spots,
          });
        }
      });

      const instructorStats = Array.from(instructorMap.values()).map(
        (inst) => ({
          ...inst,
          occupation:
            inst.totalCapacity > 0
              ? Math.round((inst.reservations / inst.totalCapacity) * 100)
              : 0,
        })
      );

      // Top by earnings
      const topByEarnings = instructorStats
        .sort((a, b) => b.earnings - a.earnings)
        .slice(0, 10);

      // Top by classes
      const topByClasses = instructorStats
        .sort((a, b) => b.classes - a.classes)
        .slice(0, 10);

      // Occupation distribution
      const occupationRanges = [
        { range: "0-20%", min: 0, max: 20, count: 0 },
        { range: "21-40%", min: 21, max: 40, count: 0 },
        { range: "41-60%", min: 41, max: 60, count: 0 },
        { range: "61-80%", min: 61, max: 80, count: 0 },
        { range: "81-100%", min: 81, max: 100, count: 0 },
      ];

      instructorStats.forEach((inst) => {
        const range = occupationRanges.find(
          (r) => inst.occupation >= r.min && inst.occupation <= r.max
        );
        if (range) {
          range.count += 1;
        }
      });

      const occupationDistribution = occupationRanges.map((r) => ({
        range: r.range,
        count: r.count,
      }));

      return {
        topByEarnings,
        topByClasses,
        occupationDistribution,
      };
    }),

  // Get class statistics
  getClasses: publicProcedure
    .input(
      z.object({
        periodId: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { user } = ctx;
      if (!user?.tenantId) {
        throw new Error("User not authenticated or tenant not found");
      }

      const periodFilter = input.periodId ? { periodId: input.periodId } : {};

      const classes = await prisma.class.findMany({
        where: {
          tenantId: user.tenantId,
          ...periodFilter,
        },
        select: {
          disciplineId: true,
          date: true,
          totalReservations: true,
          spots: true,
          discipline: {
            select: {
              name: true,
              color: true,
            },
          },
        },
      });

      // Classes by discipline
      const disciplineMap = new Map<
        string,
        {
          disciplineId: string;
          name: string;
          color: string;
          count: number;
          totalReservations: number;
          totalCapacity: number;
        }
      >();

      classes.forEach((clase) => {
        const existing = disciplineMap.get(clase.disciplineId);
        if (existing) {
          existing.count += 1;
          existing.totalReservations += clase.totalReservations;
          existing.totalCapacity += clase.spots;
        } else {
          disciplineMap.set(clase.disciplineId, {
            disciplineId: clase.disciplineId,
            name: clase.discipline.name,
            color: clase.discipline.color || "#6b7280",
            count: 1,
            totalReservations: clase.totalReservations,
            totalCapacity: clase.spots,
          });
        }
      });

      const byDiscipline = Array.from(disciplineMap.values())
        .map((disc) => ({
          disciplineId: disc.disciplineId,
          name: disc.name,
          color: disc.color,
          count: disc.count,
          averageOccupation:
            disc.totalCapacity > 0
              ? Math.round((disc.totalReservations / disc.totalCapacity) * 100)
              : 0,
        }))
        .sort((a, b) => b.count - a.count);

      // Classes by day of week
      const dayMap = new Map<
        number,
        { day: number; count: number; reservations: number }
      >();

      classes.forEach((clase) => {
        const dayOfWeek = new Date(clase.date).getDay();
        const existing = dayMap.get(dayOfWeek);
        if (existing) {
          existing.count += 1;
          existing.reservations += clase.totalReservations;
        } else {
          dayMap.set(dayOfWeek, {
            day: dayOfWeek,
            count: 1,
            reservations: clase.totalReservations,
          });
        }
      });

      const byDay = Array.from(dayMap.values()).map((day) => ({
        day: day.day,
        name: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][day.day] || "",
        count: day.count,
        reservations: day.reservations,
      }));

      // Classes by hour
      const hourMap = new Map<
        string,
        { hour: string; count: number; reservations: number }
      >();

      classes.forEach((clase) => {
        const hour = new Date(clase.date).getHours();
        const hourStr = `${hour.toString().padStart(2, "0")}:00`;
        const existing = hourMap.get(hourStr);
        if (existing) {
          existing.count += 1;
          existing.reservations += clase.totalReservations;
        } else {
          hourMap.set(hourStr, {
            hour: hourStr,
            count: 1,
            reservations: clase.totalReservations,
          });
        }
      });

      const bySchedule = Array.from(hourMap.values()).sort((a, b) =>
        a.hour.localeCompare(b.hour)
      );

      // Reservations by hour (same data, different format for chart)
      const reservationsBySchedule = bySchedule.map((h) => ({
        hour: h.hour,
        reservations: h.reservations,
        averageOccupation: 0,
      }));

      return {
        byDiscipline,
        byDay,
        bySchedule,
        reservationsBySchedule,
      };
    }),

  // Get venue statistics
  getVenues: publicProcedure
    .input(
      z.object({
        periodId: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { user } = ctx;
      if (!user?.tenantId) {
        throw new Error("User not authenticated or tenant not found");
      }

      const periodFilter = input.periodId ? { periodId: input.periodId } : {};

      const classes = await prisma.class.findMany({
        where: {
          tenantId: user.tenantId,
          ...periodFilter,
        },
        select: {
          studio: true,
          room: true,
          totalReservations: true,
          spots: true,
          instructorId: true,
          disciplineId: true,
          discipline: {
            select: {
              name: true,
              color: true,
            },
          },
        },
      });

      // Get payments for revenue calculation
      const payments = await prisma.instructorPayment.findMany({
        where: {
          tenantId: user.tenantId,
          ...periodFilter,
        },
        select: {
          instructorId: true,
          finalPayment: true,
        },
      });

      // Create a map of instructor earnings
      const instructorEarningsMap = new Map<string, number>();
      payments.forEach((payment) => {
        const existing = instructorEarningsMap.get(payment.instructorId) || 0;
        instructorEarningsMap.set(
          payment.instructorId,
          existing + payment.finalPayment
        );
      });

      // Most used venues
      const venueMap = new Map<
        string,
        {
          name: string;
          count: number;
          reservations: number;
          totalCapacity: number;
          instructors: Set<string>;
          disciplines: Map<
            string,
            { name: string; count: number; color: string }
          >;
        }
      >();

      classes.forEach((clase) => {
        const venueName = `${clase.studio} - ${clase.room}`;
        const existing = venueMap.get(venueName);

        if (existing) {
          existing.count += 1;
          existing.reservations += clase.totalReservations;
          existing.totalCapacity += clase.spots;
          existing.instructors.add(clase.instructorId);

          const discExisting = existing.disciplines.get(clase.disciplineId);
          if (discExisting) {
            discExisting.count += 1;
          } else {
            existing.disciplines.set(clase.disciplineId, {
              name: clase.discipline.name,
              count: 1,
              color: clase.discipline.color || "#6b7280",
            });
          }
        } else {
          const disciplines = new Map<
            string,
            { name: string; count: number; color: string }
          >();
          disciplines.set(clase.disciplineId, {
            name: clase.discipline.name,
            count: 1,
            color: clase.discipline.color || "#6b7280",
          });

          venueMap.set(venueName, {
            name: venueName,
            count: 1,
            reservations: clase.totalReservations,
            totalCapacity: clase.spots,
            instructors: new Set([clase.instructorId]),
            disciplines,
          });
        }
      });

      const venueStats = Array.from(venueMap.values()).map((venue) => {
        const occupation =
          venue.totalCapacity > 0
            ? Math.round((venue.reservations / venue.totalCapacity) * 100)
            : 0;

        // Calculate revenue for this venue (proportional to classes)
        let earnings = 0;
        venue.instructors.forEach((instructorId) => {
          const instructorEarnings =
            instructorEarningsMap.get(instructorId) || 0;
          const instructorClasses = classes.filter(
            (c) => c.instructorId === instructorId
          ).length;
          const venueInstructorClasses = classes.filter(
            (c) =>
              c.instructorId === instructorId &&
              `${c.studio} - ${c.room}` === venue.name
          ).length;

          if (instructorClasses > 0) {
            earnings +=
              (instructorEarnings * venueInstructorClasses) / instructorClasses;
          }
        });

        return {
          name: venue.name,
          count: venue.count,
          averageOccupation: occupation,
          totalReservations: venue.reservations,
          instructors: venue.instructors.size,
          earnings,
          disciplines: Array.from(venue.disciplines.entries()).map(
            ([disciplineId, disc]) => ({
              disciplineId,
              name: disc.name,
              count: disc.count,
              color: disc.color,
            })
          ),
        };
      });

      // Sort by usage
      const mostUsed = venueStats
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Occupation by venue
      const occupationByVenue = venueStats
        .map((v) => ({
          name: v.name,
          occupation: v.averageOccupation,
          classes: v.count,
        }))
        .sort((a, b) => b.occupation - a.occupation)
        .slice(0, 10);

      // Revenue by venue
      const earningsByVenue = venueStats
        .map((v) => ({
          name: v.name,
          earnings: v.earnings,
          classes: v.count,
          reservations: v.totalReservations,
          instructors: v.instructors,
        }))
        .sort((a, b) => b.earnings - a.earnings)
        .slice(0, 10);

      // Disciplines by venue
      const disciplinesByVenue = venueStats.map((v) => ({
        name: v.name,
        disciplines: v.disciplines,
      }));

      return {
        totalVenues: venueStats.length,
        mostUsed: mostUsed.map((v) => ({
          name: v.name,
          count: v.count,
          averageOccupation: v.averageOccupation,
          totalReservations: v.totalReservations,
          instructors: v.instructors,
        })),
        occupationByVenue,
        earningsByVenue,
        disciplinesByVenue,
      };
    }),
});
