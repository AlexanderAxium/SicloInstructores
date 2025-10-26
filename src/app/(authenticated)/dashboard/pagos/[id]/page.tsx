"use client";

import { PaymentDetailPDF } from "@/components/payments/pdf/payment-detail-pdf";
import { usePDFExport } from "@/hooks/usePDFExport";
import type { Class } from "@/types/classes";
import type {
  Discipline,
  DisciplineFromAPI,
  Instructor,
  InstructorFromAPI,
  Period,
  PeriodFromAPI,
} from "@/types/instructor";
import type {
  InstructorPayment,
  InstructorPaymentFromAPI,
} from "@/types/payments";
import type { FormulaFromAPI } from "@/types/schema";
import { trpc } from "@/utils/trpc";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { CategoryTab } from "../../../../../components/payments/detail/category-tab";
import { ClassesTab } from "../../../../../components/payments/detail/clases-tab";
import { LoadingSkeleton } from "../../../../../components/payments/detail/loading-skeleton";
// Components
import { PageHeader } from "../../../../../components/payments/detail/page-header";
import { PaymentDetails } from "../../../../../components/payments/detail/payment-detail";
import { PenalizacionesCoversTab } from "../../../../../components/payments/detail/penalizacion-cover-tab";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Award, Calendar, FileText } from "lucide-react";

// Helper functions to convert API types to regular types
const convertInstructorFromAPI = (
  instructor: InstructorFromAPI | undefined
): Instructor | undefined => {
  if (!instructor) return undefined;
  return {
    ...instructor,
    tenantId: instructor.tenantId || "",
    createdAt: new Date(instructor.createdAt),
    updatedAt: new Date(instructor.updatedAt),
  };
};

const convertPeriodFromAPI = (
  period: PeriodFromAPI | undefined
): Period | undefined => {
  if (!period) return undefined;
  return {
    ...period,
    startDate: new Date(period.startDate),
    endDate: new Date(period.endDate),
    paymentDate: new Date(period.paymentDate),
    createdAt: new Date(period.createdAt),
    updatedAt: new Date(period.updatedAt),
    discountRules: period.discountRules as
      | Record<string, unknown>
      | null
      | undefined,
  };
};

const convertDisciplinesFromAPI = (
  disciplines: DisciplineFromAPI[] | undefined
): Discipline[] => {
  if (!disciplines || !Array.isArray(disciplines)) {
    return [];
  }
  return disciplines.map((discipline) => ({
    ...discipline,
    createdAt: new Date(discipline.createdAt),
    updatedAt: new Date(discipline.updatedAt),
  }));
};

const convertPaymentFromAPI = (
  payment: InstructorPaymentFromAPI
): InstructorPayment => ({
  ...payment,
  createdAt: new Date(payment.createdAt),
  updatedAt: new Date(payment.updatedAt),
});

export default function PaymentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const paymentId = params.id as string;

  // Local state
  const [activeTab, setActiveTab] = useState<string>("details");
  const [isEditingAdjustment, setIsEditingAdjustment] =
    useState<boolean>(false);
  const [newAdjustment, setNewAdjustment] = useState<number>(0);
  const [adjustmentType, setAdjustmentType] = useState<"FIJO" | "PORCENTAJE">(
    "FIJO"
  );
  const [isUpdatingAdjustment, setIsUpdatingAdjustment] =
    useState<boolean>(false);

  // Queries
  const {
    data: payment,
    isLoading: isLoadingPayment,
    refetch: refetchPayment,
  } = trpc.payments.getById.useQuery({ id: paymentId }) as {
    data: InstructorPaymentFromAPI | undefined;
    isLoading: boolean;
    refetch: () => void;
  };

  const instructorId = payment?.instructorId || "";
  const periodId = payment?.periodId || "";

  const { data: instructorData, isLoading: isLoadingInstructor } =
    trpc.instructor.getById.useQuery(
      { id: instructorId },
      { enabled: !!instructorId }
    ) as { data: InstructorFromAPI | undefined; isLoading: boolean };

  const { data: periodData } = trpc.periods.getById.useQuery(
    { id: periodId },
    { enabled: !!periodId }
  ) as { data: PeriodFromAPI | undefined };

  const { data: classesData } = trpc.classes.getByInstructorAndPeriod.useQuery(
    { instructorId, periodId },
    { enabled: !!instructorId && !!periodId }
  ) as { data: { classes: Class[] } | undefined };

  const { data: disciplinesData } = trpc.disciplines.getAll.useQuery() as {
    data: DisciplineFromAPI[] | undefined;
  };
  const { data: formulasData } = trpc.formulas.getAll.useQuery() as {
    data: FormulaFromAPI[] | undefined;
  };

  // Extract data and convert API types to regular types
  const instructor = convertInstructorFromAPI(instructorData);
  const period = convertPeriodFromAPI(periodData);
  const classes = classesData?.classes || [];
  const disciplines = convertDisciplinesFromAPI(disciplinesData);
  const formulas = formulasData || [];
  const paymentDetails = payment?.details || {};

  // Set initial values when payment loads
  useEffect(() => {
    if (payment) {
      setNewAdjustment(payment.adjustment);
      setAdjustmentType(payment.adjustmentType as "FIJO" | "PORCENTAJE");
    }
  }, [payment]);

  // Handler functions
  const _handleBack = () => {
    router.push("/dashboard/pagos");
  };

  const { exportToPDF } = usePDFExport();

  const handleExportPDF = async () => {
    if (!payment || !instructorData || !periodData) {
      toast.error("Datos incompletos para exportar");
      return;
    }

    // Calculate discipline stats
    const classesByDiscipline = instructorClasses.reduce<
      Record<string, Class[]>
    >((acc, clase) => {
      const disciplineId = String(clase.disciplineId);
      if (!acc[disciplineId]) {
        acc[disciplineId] = [];
      }
      acc[disciplineId].push(clase);
      return acc;
    }, {});

    const disciplineStats = Object.entries(classesByDiscipline).map(
      ([disciplineId, classes]) => {
        const discipline = disciplinesData?.find(
          (d: DisciplineFromAPI) => d.id === disciplineId
        );
        const reservations = classes.reduce(
          (sum, c) => sum + (c.totalReservations || 0),
          0
        );
        const capacity = classes.reduce((sum, c) => sum + (c.spots || 0), 0);
        const occupancy =
          capacity > 0 ? Math.round((reservations / capacity) * 100) : 0;
        const baseAmount = classes.length * 30;

        return {
          disciplineId,
          name: discipline?.name || `Disciplina ${disciplineId}`,
          classes: classes.length,
          reservations,
          capacity,
          occupancy,
          baseAmount,
        };
      }
    );

    await exportToPDF(
      <PaymentDetailPDF
        payment={payment}
        instructor={instructorData}
        period={periodData}
        disciplines={disciplinesData || []}
        instructorClasses={instructorClasses}
        disciplineStats={disciplineStats}
        details={paymentDetails}
      />,
      `Pago_${instructorData.name.replace(/\s+/g, "_")}_P${periodData.number}_${periodData.year}`
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleStatusToggle = async () => {
    if (!payment) return;

    toast.info("Cambio de estado en desarrollo");
  };

  const updateAdjustment = async () => {
    if (!payment) return;

    setIsUpdatingAdjustment(true);

    try {
      // Lógica de actualización de reajuste
      toast.success("Reajuste actualizado exitosamente");
      setIsEditingAdjustment(false);
      await refetchPayment();
    } catch (_error) {
      toast.error("Error al actualizar reajuste");
    } finally {
      setIsUpdatingAdjustment(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-800/50";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:hover:bg-yellow-800/50";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700";
    }
  };

  // Helper functions
  const getInstructorClasses = () => {
    return classes.filter((c) => c.periodId === periodId);
  };

  const calculateFinalAmount = (
    amount: number,
    retention: number,
    adjustment: number,
    adjustmentType: string,
    bonus = 0
  ): number => {
    const calculatedAdjustment =
      adjustmentType === "PORCENTAJE"
        ? (amount * adjustment) / 100
        : adjustment;
    const adjustedAmount = amount + calculatedAdjustment + bonus;
    return adjustedAmount - retention;
  };

  // Loading state
  if (
    isLoadingPayment ||
    isLoadingInstructor ||
    !payment ||
    !instructor ||
    !period
  ) {
    return <LoadingSkeleton />;
  }

  // Calculate statistics
  const instructorClasses = getInstructorClasses();
  const totalReservations = instructorClasses.reduce(
    (sum, clase) => sum + clase.totalReservations,
    0
  );
  const totalCapacity = instructorClasses.reduce(
    (sum, clase) => sum + clase.spots,
    0
  );
  const averageOccupancy =
    totalCapacity > 0
      ? Math.round((totalReservations / totalCapacity) * 100)
      : 0;
  const calculatedFinalAmount = calculateFinalAmount(
    payment.amount,
    payment.retention,
    payment.adjustment,
    payment.adjustmentType,
    payment.bonus || 0
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <PageHeader
        instructor={instructorData || ({} as InstructorFromAPI)}
        period={periodData || ({} as PeriodFromAPI)}
        payment={payment}
        getStatusColor={getStatusColor}
        togglePaymentStatus={handleStatusToggle}
        handleExportPDF={handleExportPDF}
        handlePrint={handlePrint}
        router={router}
      />

      {/* Main Content */}
      <Card className="border border-border overflow-hidden bg-card">
        <CardHeader className="border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 bg-card">
          <div className="space-y-1">
            <CardTitle className="text-lg sm:text-xl text-foreground">
              Información del Pago
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
              Detalles para {instructor.name}
            </CardDescription>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <div className="flex items-center bg-muted/10 rounded-md px-2 py-1 sm:px-3 sm:py-1.5 border border-border text-xs sm:text-sm">
              <span className="text-muted-foreground mr-1">Estado:</span>
              <Badge
                variant="outline"
                className={`${getStatusColor(payment.status)} px-1 sm:px-2 text-xs`}
              >
                {payment.status === "PAID" ? "APROBADO" : "PENDIENTE"}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleStatusToggle}
              className="bg-card border border-border hover:bg-muted/10 hover:text-foreground h-8 px-2 sm:px-3 text-xs"
            >
              {payment.status === "PENDING" ? "Aprobar" : "Pendiente"}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-4 p-2 sm:pt-6">
          {/* Custom Tabs */}
          <div className="w-full mb-4 sm:mb-6 overflow-x-auto">
            <div className="flex border-b border-border min-w-max sm:min-w-0">
              <button
                type="button"
                onClick={() => setActiveTab("details")}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 font-medium text-sm sm:text-sm transition-colors relative ${
                  activeTab === "details"
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-center">
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Resumen</span>
                  <span className="sm:hidden">Pago</span>
                </div>
                {activeTab === "details" && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("penalties-covers")}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 font-medium text-sm sm:text-sm transition-colors relative ${
                  activeTab === "penalties-covers"
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-center">
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Detalles</span>
                  <span className="sm:hidden">Det.</span>
                </div>
                {activeTab === "penalties-covers" && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("classes")}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 font-medium text-sm sm:text-sm transition-colors relative ${
                  activeTab === "classes"
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Clases</span>
                  <span className="sm:hidden">Cls.</span>
                </div>
                {activeTab === "classes" && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("category")}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 font-medium text-sm sm:text-sm transition-colors relative ${
                  activeTab === "category"
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-center">
                  <Award className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Categoría</span>
                  <span className="sm:hidden">Cat.</span>
                </div>
                {activeTab === "category" && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
                )}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="mt-2 sm:mt-4">
            {/* Details Tab */}
            {activeTab === "details" && instructor && period && (
              <PaymentDetails
                payment={convertPaymentFromAPI(payment)}
                instructor={instructor}
                period={period}
                disciplines={disciplines}
                isEditingAdjustment={isEditingAdjustment}
                setIsEditingAdjustment={setIsEditingAdjustment}
                newAdjustment={newAdjustment}
                setNewAdjustment={setNewAdjustment}
                adjustmentType={adjustmentType}
                setAdjustmentType={setAdjustmentType}
                isUpdatingAdjustment={isUpdatingAdjustment}
                updateAdjustment={updateAdjustment}
                formatCurrency={formatCurrency}
                calculatedFinalAmount={calculatedFinalAmount}
                averageOccupancy={averageOccupancy}
                instructorClasses={instructorClasses}
                totalReservations={totalReservations}
                totalCapacity={totalCapacity}
                instructorCovers={[]}
              />
            )}

            {/* Classes Tab */}
            {activeTab === "classes" && (
              <ClassesTab
                instructorClasses={instructorClasses}
                disciplines={disciplines}
              />
            )}

            {/* Category Tab */}
            {activeTab === "category" && instructorData && periodData && (
              <CategoryTab
                instructor={instructorData}
                payment={payment}
                period={periodData}
                disciplines={disciplinesData || []}
                instructorClasses={instructorClasses}
                formulas={formulas}
              />
            )}

            {/* Penalties and Covers Tab */}
            {activeTab === "penalties-covers" && (
              <PenalizacionesCoversTab
                payment={payment}
                details={paymentDetails}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
