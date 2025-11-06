"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useInstructorAuth } from "@/contexts/InstructorAuthContext";
import type { ClassFromAPI } from "@/types/classes";
import { trpc } from "@/utils/trpc";
import { Calendar, FileText, GraduationCap, TrendingUp } from "lucide-react";

export function InstructorStats() {
  const { instructor, isAuthenticated } = useInstructorAuth();

  // Get instructor statistics
  const { data: statsData, isLoading: isLoadingStats } =
    trpc.instructor.getStats.useQuery(
      { instructorId: instructor?.id || "" },
      { enabled: !!instructor?.id }
    );

  // Get recent payments for total paid and last payment
  const { data: paymentsData, isLoading: isLoadingPayments } =
    trpc.payments.getWithFilters.useQuery(
      {
        instructorId: instructor?.id,
        limit: 1000,
        offset: 0,
      },
      { enabled: !!instructor?.id }
    );

  // Get classes to calculate accurate occupation
  const { data: classesData, isLoading: isLoadingClasses } =
    trpc.classes.getByInstructor.useQuery(
      { instructorId: instructor?.id || "" },
      { enabled: !!instructor?.id }
    );

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (!isAuthenticated || !instructor) {
    return null;
  }

  if (isLoadingStats || isLoadingPayments || isLoadingClasses) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }, (_, i) => `skeleton-card-${i}`).map((id) => (
          <Card key={id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = statsData?.stats;
  const instructorInfo = statsData?.instructor;
  // Use the actual return type from the query instead of a strict type
  // The query returns Prisma results which may have slightly different types
  const payments = (paymentsData?.payments || []) as Array<{
    finalPayment: number;
    period: { number: number; year: number };
  }>;
  const classes: ClassFromAPI[] = classesData?.classes || [];

  if (!stats || !instructorInfo) {
    return null;
  }

  // Calculate accurate average occupation from all classes
  const averageOccupation =
    classes.length > 0
      ? classes.reduce((sum, classItem) => {
          const occupation =
            classItem.spots > 0
              ? (classItem.totalReservations / classItem.spots) * 100
              : 0;
          return sum + occupation;
        }, 0) / classes.length
      : 0;

  // Get last payment (most recent)
  const lastPayment = payments.length > 0 ? payments[0] : null;

  const statCards = [
    {
      title: "Total Clases",
      value: stats.totalClasses,
      icon: GraduationCap,
      description: "Clases impartidas",
      color: "text-blue-600",
    },
    {
      title: "Promedio de Ocupación",
      value: `${Math.round(averageOccupation)}%`,
      icon: TrendingUp,
      description: "Último período",
      color: "text-green-600",
    },
    {
      title: "Último Pago",
      value: lastPayment ? formatCurrency(lastPayment.finalPayment) : "N/A",
      icon: Calendar,
      description: lastPayment
        ? `Período ${lastPayment.period.number}/${lastPayment.period.year}`
        : "Sin pagos",
      color: "text-purple-600",
    },
    {
      title: "Total de Pagos",
      value: payments.length,
      icon: FileText,
      description: "Pagos registrados",
      color: "text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
