"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { TableColumn } from "@/components/ui/scrollable-table";
import { ScrollableTable } from "@/components/ui/scrollable-table";
import { useInstructorAuth } from "@/contexts/InstructorAuthContext";
import { usePagination } from "@/hooks/usePagination";
import type { PaymentsListResponse } from "@/types/payments";
import { trpc } from "@/utils/trpc";
import { ArrowRight, DollarSign, Eye } from "lucide-react";
import Link from "next/link";

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

  // Paginación para pagos
  const paymentsPagination = usePagination({
    defaultLimit: 10,
    defaultPage: 1,
  });

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

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(amount);
  };

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
          {formatCurrency(record.amount)}
        </span>
      ),
    },
    {
      key: "finalPayment",
      title: "Pago Final",
      width: "120px",
      render: (_, record) => (
        <span className="text-sm font-semibold text-green-600">
          {formatCurrency(record.finalPayment)}
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
          <div className="font-medium">{formatCurrency(record.bonus || 0)}</div>
          <div className="text-xs text-muted-foreground">
            VS: {formatCurrency(record.versusBonus)}
          </div>
        </div>
      ),
    },
    {
      key: "acciones",
      title: "Acciones",
      width: "80px",
      headerClassName: "text-center",
      render: (_, record) => (
        <div className="flex justify-center">
          <Link href={`/pago/${record.id}`}>
            <Eye className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
          </Link>
        </div>
      ),
    },
  ];

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return {
          color: "bg-green-100 text-green-800 hover:bg-green-200",
          text: "Pagado",
        };
      case "PENDING":
        return {
          color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
          text: "Pendiente",
        };
      default:
        return {
          color: "bg-red-100 text-red-800 hover:bg-red-200",
          text: "Cancelado",
        };
    }
  };

  return (
    <Card>
      <CardContent className="p-0">
        {/* Versión móvil - Cards */}
        <div className="md:hidden">
          <div className="p-4 pb-2 border-b border-border">
            <h3 className="text-sm font-medium flex items-center gap-1.5">
              <DollarSign className="h-4 w-4" />
              Pagos ({totalPayments})
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {isLoadingPayments ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }, (_, i) => `skeleton-${i}`).map(
                  (key) => (
                    <Card key={key} className="animate-pulse">
                      <CardContent className="p-4">
                        <div className="h-20 bg-muted rounded" />
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-sm text-muted-foreground">
                  No hay pagos registrados
                </p>
              </div>
            ) : (
              <>
                {payments.map((payment) => {
                  const statusBadge = getStatusBadge(payment.status);
                  return (
                    <Card key={payment.id} className="overflow-hidden">
                      <CardContent className="p-4 grid gap-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">
                              Período {payment.period.number}/
                              {payment.period.year}
                            </h4>
                          </div>
                          <Badge
                            variant="secondary"
                            className={`text-xs font-medium ${statusBadge.color}`}
                          >
                            {statusBadge.text}
                          </Badge>
                        </div>

                        {/* Resumen financiero */}
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs">
                              Monto Base Total
                            </p>
                            <p className="font-medium">
                              {formatCurrency(payment.amount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">
                              Retención Total
                            </p>
                            <p className="text-destructive font-medium">
                              -{formatCurrency(payment.retention)}
                            </p>
                          </div>
                          {payment.cover > 0 && (
                            <div>
                              <p className="text-muted-foreground text-xs">
                                Covers
                              </p>
                              <p className="text-green-600 font-medium">
                                +{formatCurrency(payment.cover)}
                              </p>
                            </div>
                          )}
                          {payment.branding > 0 && (
                            <div>
                              <p className="text-muted-foreground text-xs">
                                Brandeo
                              </p>
                              <p className="text-green-600 font-medium">
                                +{formatCurrency(payment.branding)}
                              </p>
                            </div>
                          )}
                          {payment.themeRide > 0 && (
                            <div>
                              <p className="text-muted-foreground text-xs">
                                Theme Ride
                              </p>
                              <p className="text-green-600 font-medium">
                                +{formatCurrency(payment.themeRide)}
                              </p>
                            </div>
                          )}
                          {payment.workshop > 0 && (
                            <div>
                              <p className="text-muted-foreground text-xs">
                                Workshop
                              </p>
                              <p className="text-green-600 font-medium">
                                +{formatCurrency(payment.workshop)}
                              </p>
                            </div>
                          )}
                          {payment.penalty > 0 && (
                            <div>
                              <p className="text-muted-foreground text-xs">
                                Penalización
                              </p>
                              <p className="text-destructive font-medium">
                                -{formatCurrency(payment.penalty)}
                              </p>
                            </div>
                          )}
                        </div>

                        {payment.comments &&
                          !payment.comments.startsWith(
                            "Cálculo automático"
                          ) && (
                            <div className="pt-2 border-t border-border">
                              <p className="text-xs text-muted-foreground">
                                {payment.comments}
                              </p>
                            </div>
                          )}

                        <div className="flex items-center justify-between pt-2 border-t border-border">
                          <div>
                            <p className="text-muted-foreground text-xs mb-1">
                              MONTO FINAL
                            </p>
                            <div className="flex items-center font-medium text-lg">
                              <ArrowRight className="mr-1 h-4 w-4 text-muted-foreground" />
                              {formatCurrency(payment.finalPayment)}
                            </div>
                          </div>
                          <Link href={`/pago/${payment.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              Ver Detalles
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {/* Paginación móvil */}
                {paymentsPaginationInfo.totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        paymentsPagination.setPage(
                          Math.max(1, paymentsPagination.page - 1)
                        )
                      }
                      disabled={!paymentsPaginationInfo.hasPrev}
                    >
                      Anterior
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Página {paymentsPagination.page} de{" "}
                      {paymentsPaginationInfo.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        paymentsPagination.setPage(
                          Math.min(
                            paymentsPaginationInfo.totalPages,
                            paymentsPagination.page + 1
                          )
                        )
                      }
                      disabled={!paymentsPaginationInfo.hasNext}
                    >
                      Siguiente
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Versión desktop - Tabla */}
        <div className="hidden md:block">
          <div className="p-4 pb-2 border-b border-border">
            <h3 className="text-sm font-medium flex items-center gap-1.5">
              <DollarSign className="h-4 w-4" />
              Pagos ({totalPayments})
            </h3>
          </div>
          <div className="p-4">
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
