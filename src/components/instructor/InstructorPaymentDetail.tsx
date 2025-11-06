"use client";

import { PaymentDetailPDF } from "@/components/payments/pdf/payment-detail-pdf";
import { usePDFExport } from "@/hooks/usePDFExport";
import type { Class, ClassFromAPI } from "@/types/classes";
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
  InstructorPaymentWithRelationsFromAPI,
} from "@/types/payments";
import type { FormulaFromAPI } from "@/types/schema";
import { trpc } from "@/utils/trpc";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { CategoryTab } from "@/components/payments/detail/category-tab";
import { ClassesTab } from "@/components/payments/detail/clases-tab";
import { LoadingSkeleton } from "@/components/payments/detail/loading-skeleton";
import { PageHeader } from "@/components/payments/detail/page-header";
import { PaymentDetails } from "@/components/payments/detail/payment-detail";
import { PenalizacionesCoversTab } from "@/components/payments/detail/penalizacion-cover-tab";

import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useInstructorAuth } from "@/contexts/InstructorAuthContext";
import {
  Award,
  Calendar,
  ChevronDown,
  Download,
  FileText,
  Printer,
} from "lucide-react";

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

const convertClassesFromAPI = (classes: ClassFromAPI[]): Class[] => {
  return classes.map((clase) => ({
    ...clase,
    date: new Date(clase.date),
    createdAt: new Date(clase.createdAt),
    updatedAt: new Date(clase.updatedAt),
  }));
};

export default function InstructorPaymentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const paymentId = params.id as string;
  const { instructor, isAuthenticated } = useInstructorAuth();

  // Local state
  const [activeTab, setActiveTab] = useState<string>("details");

  // Queries
  const paymentQuery = trpc.payments.getById.useQuery({ id: paymentId });
  const payment = paymentQuery.data as
    | InstructorPaymentWithRelationsFromAPI
    | undefined;
  const isLoadingPayment = paymentQuery.isLoading;

  const instructorId = payment?.instructorId || "";
  const periodId = payment?.periodId || "";

  const instructorQuery = trpc.instructor.getById.useQuery(
    { id: instructorId },
    { enabled: !!instructorId }
  );
  const periodQuery = trpc.periods.getById.useQuery(
    { id: periodId },
    { enabled: !!periodId }
  );
  const classesQuery = trpc.classes.getByInstructorAndPeriod.useQuery(
    { instructorId, periodId },
    { enabled: !!instructorId && !!periodId }
  );
  const disciplinesQuery = trpc.disciplines.getAll.useQuery();
  const { data: formulasData } = trpc.formulas.getByPeriod.useQuery(
    { periodId: periodId },
    { enabled: !!periodId }
  ) as { data: { formulas: FormulaFromAPI[]; stats: unknown } | undefined };

  const instructorData = instructorQuery.data as InstructorFromAPI | undefined;
  const periodData = periodQuery.data as PeriodFromAPI | undefined;
  const classesData = classesQuery.data;
  const disciplinesData = disciplinesQuery.data;

  // Extract data and convert API types to regular types
  const instructorConverted = convertInstructorFromAPI(instructorData);
  const period = convertPeriodFromAPI(periodData);
  const classesFromAPI = (classesData?.classes || []) as ClassFromAPI[];
  const classes = convertClassesFromAPI(classesFromAPI);
  const disciplines = convertDisciplinesFromAPI(disciplinesData?.disciplines);
  const formulas = formulasData?.formulas || [];
  const paymentDetails = payment?.details || {};

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/instructor/login");
    }
  }, [isAuthenticated, router]);

  // Check if payment belongs to the instructor
  useEffect(() => {
    if (payment && instructor && payment.instructorId !== instructor.id) {
      toast.error("No tienes acceso a este pago");
      router.push("/instructor");
    }
  }, [payment, instructor, router]);

  const { exportToPDF } = usePDFExport();

  const handleExportPDF = async () => {
    if (!payment || !instructorData || !periodData) {
      toast.error("Datos incompletos para exportar");
      return;
    }

    // Calculate discipline stats
    const instructorClasses = getInstructorClasses();
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
        const discipline = disciplines.find((d) => d.id === disciplineId);
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
        disciplines={disciplinesData?.disciplines || []}
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

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const _getStatusColor = (status: string): string => {
    switch (status) {
      case "PAID":
        return "bg-green-500/15 text-green-600 border-green-600 dark:bg-green-500/15 dark:text-green-400 dark:border-green-400";
      case "PENDING":
        return "bg-yellow-500/15 text-yellow-600 border-yellow-600 dark:bg-yellow-500/15 dark:text-yellow-400 dark:border-yellow-400";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700";
    }
  };

  // Helper functions
  const getInstructorClasses = () => {
    return classes.filter((c) => c.periodId === periodId);
  };

  // Loading state
  if (isLoadingPayment || !payment || !instructor || !period) {
    return <LoadingSkeleton />;
  }

  if (!isAuthenticated) {
    return null;
  }

  // Calculate statistics
  const instructorClasses = getInstructorClasses();
  const totalReservations = instructorClasses.reduce(
    (sum, clase) => sum + (clase.totalReservations || 0),
    0
  );
  const totalCapacity = instructorClasses.reduce(
    (sum, clase) => sum + (clase.spots || 0),
    0
  );
  const averageOccupancy =
    totalCapacity > 0
      ? Math.round((totalReservations / totalCapacity) * 100)
      : 0;

  const _formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat("es-PE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  // Create a custom router for instructor context
  const _instructorRouter = {
    push: (path: string) => router.push(path),
    back: () => router.back(),
  };

  // Calculate classes summary for header
  const classesCount = instructorClasses.length;
  const classesByDiscipline = instructorClasses.reduce<Record<string, Class[]>>(
    (acc, clase) => {
      const disciplineId = String(clase.disciplineId);
      if (!acc[disciplineId]) {
        acc[disciplineId] = [];
      }
      acc[disciplineId].push(clase);
      return acc;
    },
    {}
  );
  const disciplinesCount = Object.keys(classesByDiscipline).length;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header - Read-only version for instructors */}
      <div className="flex flex-col gap-4 bg-card rounded-lg p-4 sm:p-6 shadow-sm border border-border">
        {/* Top section: Title and back button */}
        <div className="flex items-start gap-3 w-full">
          <button
            type="button"
            onClick={() => router.push("/instructor")}
            className="h-8 w-8 sm:h-10 sm:w-10 shrink-0 flex items-center justify-center cursor-pointer rounded-md border border-border hover:bg-muted/10 bg-transparent p-0 transition-colors"
          >
            <svg
              className="h-4 w-4 sm:h-5 sm:w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              role="img"
              aria-label="Volver"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
              Detalle de Pago
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground truncate mt-1">
              {instructor.name} -{" "}
              {period ? `P${period.number} ${period.year}` : ""}
            </p>
          </div>

          {/* Export dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="h-9 px-3 sm:px-4 inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background text-sm font-medium hover:bg-muted/50 hover:text-foreground transition-colors"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Exportar</span>
                <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={handleExportPDF}
              >
                <FileText className="mr-2 h-4 w-4" />
                Exportar a PDF
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={handlePrint}
              >
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Classes summary section */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-3 border-t border-border">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground mb-1">Clases</span>
            <span className="text-base sm:text-lg font-semibold text-foreground">
              {classesCount}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground mb-1">
              Disciplinas
            </span>
            <span className="text-base sm:text-lg font-semibold text-foreground">
              {disciplinesCount}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground mb-1">
              Ocupación
            </span>
            <span className="text-base sm:text-lg font-semibold text-foreground">
              {averageOccupancy}%
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground mb-1">
              Monto Final
            </span>
            <span className="text-base sm:text-lg font-semibold text-foreground">
              {formatCurrency(payment.finalPayment)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Card className="border border-border overflow-hidden bg-card">
        <CardContent className="p-2 sm:p-4">
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
                  <span>Resumen</span>
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
                  <span>Detalles</span>
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
                  <span>Clases</span>
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
                  <span>Categoría</span>
                </div>
                {activeTab === "category" && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
                )}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="mt-2 sm:mt-4">
            {/* Details Tab - Read-only version */}
            {activeTab === "details" && instructorConverted && period && (
              <PaymentDetails
                payment={convertPaymentFromAPI(payment)}
                instructor={instructorConverted}
                period={period}
                disciplines={disciplines}
                isEditingAdjustment={false}
                setIsEditingAdjustment={() => {}}
                newAdjustment={0}
                setNewAdjustment={() => {}}
                adjustmentType="FIJO"
                setAdjustmentType={() => {}}
                isUpdatingAdjustment={false}
                updateAdjustment={() => {}}
                formatCurrency={formatCurrency}
                calculatedFinalAmount={payment.finalPayment}
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
                payment={payment}
              />
            )}

            {/* Category Tab */}
            {activeTab === "category" && instructorData && periodData && (
              <CategoryTab
                instructor={instructorData}
                payment={payment}
                period={periodData}
                disciplines={disciplinesData?.disciplines || []}
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
