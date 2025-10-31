"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { TableColumn } from "@/components/ui/scrollable-table";
import { ScrollableTable } from "@/components/ui/scrollable-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInstructorAuth } from "@/contexts/InstructorAuthContext";
import { usePagination } from "@/hooks/usePagination";
import type { PaymentsListResponse } from "@/types/payments";
import { trpc } from "@/utils/trpc";
import { DollarSign, GraduationCap } from "lucide-react";
import { useState } from "react";

// Tipo para las clases del instructor
interface InstructorClass {
  id: string;
  date: string;
  totalReservations: number;
  paidReservations: number;
  spots: number;
  specialText?: string | null;
  isVersus: boolean;
  versusNumber?: number | null;
  discipline: {
    name: string;
    color?: string | null;
  };
  period: {
    number: number;
    year: number;
  };
}

// Tipo para los pagos del instructor
interface InstructorPaymentWithPeriod {
  id: string;
  status: string;
  period: {
    number: number;
    year: number;
    startDate: string;
    endDate: string;
  };
  cover: number;
  comments: string | null;
  penalty: number;
  amount: number;
  retention: number;
  branding: number;
  themeRide: number;
  workshop: number;
  versusBonus: number;
  bonus: number | null;
  finalPayment: number;
}

export function InstructorTabs() {
  const { instructor, isAuthenticated } = useInstructorAuth();

  // Paginación para clases
  const _classesPagination = usePagination({
    defaultLimit: 10,
    defaultPage: 1,
  });

  // Paginación para pagos
  const paymentsPagination = usePagination({
    defaultLimit: 10,
    defaultPage: 1,
  });

  // Get classes with pagination
  const { data: classesData, isLoading: isLoadingClasses } =
    trpc.classes.getByInstructor.useQuery(
      { instructorId: instructor?.id || "" },
      { enabled: !!instructor?.id }
    );

  // Get payments with pagination
  const { data: paymentsData, isLoading: isLoadingPayments } =
    trpc.payments.getWithFilters.useQuery(
      {
        instructorId: instructor?.id,
        limit: paymentsPagination.limit,
        offset: (paymentsPagination.page - 1) * paymentsPagination.limit,
      },
      { enabled: !!instructor?.id }
    );

  if (!isAuthenticated || !instructor) {
    return null;
  }

  // Definir columnas para la tabla de clases
  const classColumns: TableColumn<InstructorClass>[] = [
    {
      key: "id",
      title: "ID",
      width: "80px",
      render: (_, record) => (
        <span className="text-xs font-mono text-muted-foreground">
          {record.id}
        </span>
      ),
    },
    {
      key: "date",
      title: "Fecha",
      width: "120px",
      render: (_, record) => (
        <span className="text-sm">
          {new Date(record.date).toLocaleDateString("es-PE")}
        </span>
      ),
    },
    {
      key: "time",
      title: "Hora",
      width: "80px",
      render: (_, record) => (
        <span className="text-sm">
          {new Date(record.date).toLocaleTimeString("es-PE", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    },
    {
      key: "discipline",
      title: "Disciplina",
      width: "150px",
      render: (_, record) => (
        <div className="flex items-center gap-1.5">
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: record.discipline.color || "#6b7280" }}
          />
          <span className="font-medium text-sm truncate">
            {record.discipline.name}
          </span>
        </div>
      ),
    },
    {
      key: "totalReservations",
      title: "Reservas (Total)",
      width: "120px",
      headerClassName: "text-center",
      render: (_, record) => (
        <div className="text-sm text-center">
          <div className="font-medium">{record.totalReservations}</div>
        </div>
      ),
    },
    {
      key: "spots",
      title: "Lugares",
      width: "120px",
      headerClassName: "text-center",
      render: (_, record) => (
        <div className="text-sm text-center">
          <div className="font-medium">{record.spots}</div>
        </div>
      ),
    },
    {
      key: "period",
      title: "Período",
      width: "100px",
      headerClassName: "text-center",
      render: (_, record) => (
        <div className="text-sm text-center">
          <span className="block">
            {record.period.number}/{record.period.year}
          </span>
          {record.isVersus && (
            <Badge variant="default" className="text-xs mt-1">
              VS
            </Badge>
          )}
        </div>
      ),
    },
  ];

  // Definir columnas para la tabla de pagos
  const paymentColumns: TableColumn<InstructorPaymentWithPeriod>[] = [
    {
      key: "period",
      title: "Período",
      width: "100px",
      headerClassName: "text-center",
      render: (_, record) => (
        <span className="text-sm text-center block">
          {record.period.number}/{record.period.year}
        </span>
      ),
    },
    {
      key: "amount",
      title: "Monto Base",
      width: "120px",
      render: (_, record) => (
        <span className="text-sm font-medium">
          S/ {record.amount.toFixed(2)}
        </span>
      ),
    },
    {
      key: "finalPayment",
      title: "Pago Final",
      width: "120px",
      render: (_, record) => (
        <span className="text-sm font-semibold text-green-600">
          S/ {record.finalPayment.toFixed(2)}
        </span>
      ),
    },
    {
      key: "status",
      title: "Estado",
      width: "100px",
      render: (_, record) => (
        <Badge
          variant="secondary"
          className={`text-xs font-medium ${
            record.status === "PAID"
              ? "bg-green-100 text-green-800 hover:bg-green-200"
              : record.status === "PENDING"
                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                : "bg-red-100 text-red-800 hover:bg-red-200"
          }`}
        >
          {record.status === "PAID"
            ? "Pagado"
            : record.status === "PENDING"
              ? "Pendiente"
              : "Cancelado"}
        </Badge>
      ),
    },
    {
      key: "bonus",
      title: "Bonificaciones",
      width: "120px",
      render: (_, record) => (
        <div className="text-sm">
          <div className="font-medium">S/ {(record.bonus || 0).toFixed(2)}</div>
          <div className="text-xs text-muted-foreground">
            VS: S/ {record.versusBonus.toFixed(2)}
          </div>
        </div>
      ),
    },
  ];

  const classes = classesData?.classes || [];
  const paymentsDataTyped = paymentsData as PaymentsListResponse | undefined;
  const payments: InstructorPaymentWithPeriod[] =
    paymentsDataTyped?.payments.map((p) => ({
      id: p.id,
      status: p.status,
      period: {
        number: p.period?.number || 0,
        year: p.period?.year || 0,
        startDate: p.period?.startDate || "",
        endDate: p.period?.endDate || "",
      },
      cover: p.cover,
      comments: p.comments || null,
      penalty: p.penalty,
      amount: p.amount,
      retention: p.retention,
      branding: p.branding,
      themeRide: p.themeRide,
      workshop: p.workshop,
      versusBonus: p.versusBonus,
      bonus: p.bonus || null,
      finalPayment: p.finalPayment,
    })) || [];
  const totalPayments = paymentsDataTyped?.total || 0;

  // Información de paginación para pagos
  const paymentsPaginationInfo = {
    total: totalPayments,
    page: paymentsPagination.page,
    limit: paymentsPagination.limit,
    totalPages: Math.ceil(totalPayments / paymentsPagination.limit),
    hasNext: paymentsPagination.page * paymentsPagination.limit < totalPayments,
    hasPrev: paymentsPagination.page > 1,
  };

  // Información de paginación para clases (sin paginación real, solo para mostrar todas)
  const classesPaginationInfo = {
    total: classes.length,
    page: 1,
    limit: classes.length,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  };

  return (
    <Card>
      <CardContent className="p-0">
        <Tabs defaultValue="clases" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-8 bg-muted/30 rounded-none border-b border-border">
            <TabsTrigger
              value="clases"
              className="flex items-center gap-1.5 text-sm py-1 h-6 data-[state=active]:shadow-none data-[state=active]:bg-white"
            >
              <GraduationCap className="h-3.5 w-3.5" />
              Clases ({classes.length})
            </TabsTrigger>
            <TabsTrigger
              value="pagos"
              className="flex items-center gap-1.5 text-sm py-1 h-6 data-[state=active]:shadow-none data-[state=active]:bg-white"
            >
              <DollarSign className="h-3.5 w-3.5" />
              Pagos ({totalPayments})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clases" className="mt-0 p-4">
            <ScrollableTable<InstructorClass>
              data={classes}
              columns={classColumns}
              loading={isLoadingClasses}
              error={undefined}
              pagination={classesPaginationInfo}
              onPageChange={() => {}}
              onPageSizeChange={() => {}}
              emptyMessage="No hay clases asignadas"
              emptyIcon={
                <GraduationCap className="h-12 w-12 text-muted-foreground" />
              }
            />
          </TabsContent>

          <TabsContent value="pagos" className="mt-0 p-4">
            <ScrollableTable<InstructorPaymentWithPeriod>
              data={payments}
              columns={paymentColumns}
              loading={isLoadingPayments}
              error={undefined}
              pagination={paymentsPaginationInfo}
              onPageChange={paymentsPagination.setPage}
              onPageSizeChange={paymentsPagination.setLimit}
              emptyMessage="No hay pagos registrados"
              emptyIcon={
                <DollarSign className="h-12 w-12 text-muted-foreground" />
              }
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
