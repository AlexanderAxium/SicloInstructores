"use client";

import { ReajusteEditor } from "@/components/payments/reajuste-editor";
import { RecalcularDialog } from "@/components/payments/recalcular-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ScrollableTable,
  type TableAction,
  type TableColumn,
} from "@/components/ui/scrollable-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useExcelExport } from "@/hooks/useExcelExport";
import { usePagination } from "@/hooks/usePagination";
import { usePeriodFilter } from "@/hooks/usePeriodFilter";
import { useRBAC } from "@/hooks/useRBAC";
import { CATEGORIES_CONFIG, mostrarCategoriaVisual } from "@/lib/config";
import type { InstructorCategoryType } from "@/types/instructor";
import { PermissionAction, PermissionResource } from "@/types/rbac";
import { trpc } from "@/utils/trpc";
import {
  Calculator,
  Calendar,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  HelpCircle,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

// Types
type InstructorPayment = {
  id: string;
  amount: number;
  status: string;
  instructorId: string;
  periodId: string;
  retention: number;
  adjustment: number;
  adjustmentType: string;
  penalty: number;
  cover: number;
  branding: number;
  themeRide: number;
  workshop: number;
  versusBonus: number;
  bonus: number | null;
  finalPayment: number;
  comments: string | null;
  createdAt: string;
  updatedAt: string;
  instructor: {
    id: string;
    name: string;
    fullName: string | null;
    categories?: Array<{
      id: string;
      category: string;
      discipline: {
        id: string;
        name: string;
      };
    }>;
  };
  period: {
    id: string;
    number: number;
    year: number;
  };
};

export default function PagosPage() {
  const { hasPermission } = useRBAC();

  // Permisos específicos para pagos
  const canReadPayment = hasPermission(
    PermissionAction.READ,
    PermissionResource.PAGO_INSTRUCTOR
  );
  const canUpdatePayment = hasPermission(
    PermissionAction.UPDATE,
    PermissionResource.PAGO_INSTRUCTOR
  );
  const _canManagePayment = hasPermission(
    PermissionAction.MANAGE,
    PermissionResource.PAGO_INSTRUCTOR
  );

  // Hook para filtro de periodo compartido
  const { selectedPeriod, setSelectedPeriod } = usePeriodFilter();

  // Estados para filtros
  const [searchText, setSearchText] = useState("");
  const [selectedInstructor, setSelectedInstructor] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Estados para edición de reajuste
  const [editandoPagoId, setEditandoPagoId] = useState<string | null>(null);
  const [nuevoReajuste, setNuevoReajuste] = useState(0);
  const [tipoReajuste, setTipoReajuste] = useState<"FIJO" | "PORCENTAJE">(
    "FIJO"
  );
  const [isActualizandoReajuste, setIsActualizandoReajuste] = useState(false);

  // Estado para recálculo
  const [_recalculandoPagoId, setRecalculandoPagoId] = useState<string | null>(
    null
  );

  // Diálogo de recálculo
  const [recalcDialogOpen, setRecalcDialogOpen] = useState(false);
  const [recalcTarget, setRecalcTarget] = useState<{
    instructorId: string;
    periodId: string;
    instructorName?: string;
    periodLabel?: string;
  } | null>(null);

  const router = useRouter();
  const { exportToExcel } = useExcelExport();

  // Obtener utils de tRPC
  const utils = trpc.useUtils();

  // Paginación
  const pagination = usePagination({
    defaultLimit: 10,
    defaultPage: 1,
  });

  // Obtener datos para filtros
  const { data: instructorsData } = trpc.instructor.getAll.useQuery();
  const { data: periodsData } = trpc.periods.getAll.useQuery();

  const instructors = instructorsData?.instructors || [];
  const periods = periodsData?.periods || [];

  // Obtener pagos con filtros usando tRPC
  const { data: paymentsData, isLoading } =
    trpc.payments.getWithFilters.useQuery({
      limit: pagination.limit,
      offset: (pagination.page - 1) * pagination.limit,
      search: searchText,
      instructorId:
        selectedInstructor !== "all" ? selectedInstructor : undefined,
      periodId: selectedPeriod !== "all" ? selectedPeriod : undefined,
      status:
        selectedStatus !== "all"
          ? (selectedStatus as "PENDING" | "PAID" | "CANCELLED")
          : undefined,
    });

  const payments = paymentsData?.payments || [];
  const totalPayments = paymentsData?.total || 0;

  const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(amount);

  // Configuración de columnas de la tabla (siguiendo el orden del sistema antiguo)
  const columns: TableColumn<InstructorPayment>[] = [
    {
      key: "instructor",
      title: "Instructor",
      width: "200px",
      render: (_, payment) => {
        // Get categories for this instructor and period
        const categories = payment.instructor.categories || [];

        // Filter only visual categories
        const visualCategories = categories.filter((cat) =>
          mostrarCategoriaVisual(cat.discipline.name)
        );

        // Find the highest category (excluding INSTRUCTOR)
        let highestCategory: InstructorCategoryType | null = null;
        const priorityOrder = CATEGORIES_CONFIG.PRIORITY_ORDER.filter(
          (cat) => cat !== "INSTRUCTOR"
        );

        for (const categoryPriority of priorityOrder) {
          if (
            visualCategories.some((cat) => cat.category === categoryPriority)
          ) {
            highestCategory = categoryPriority as InstructorCategoryType;
            break;
          }
        }

        const categoryName = highestCategory
          ? CATEGORIES_CONFIG.DISPLAY_NAMES[highestCategory]
          : null;
        const categoryColor = highestCategory
          ? CATEGORIES_CONFIG.BADGE_COLORS[highestCategory]
          : null;

        return (
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground">
              {payment.instructor.name}
            </span>
            {highestCategory && categoryName && categoryColor && (
              <Badge variant="outline" className={`${categoryColor} text-xs`}>
                {categoryName}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      key: "period",
      title: "Período",
      width: "120px",
      render: (_, payment) => (
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3 text-primary/60" />
          <span className="text-sm">
            {payment.period.number} - {payment.period.year}
          </span>
        </div>
      ),
    },
    {
      key: "amount",
      title: "Monto Base",
      width: "120px",
      render: (_, payment) => (
        <span className="text-sm">{formatCurrency(payment.amount)}</span>
      ),
    },
    {
      key: "bonuses",
      title: "Bonos",
      width: "150px",
      render: (_, payment) => {
        const totalBonuses =
          (payment.cover || 0) +
          payment.branding +
          payment.themeRide +
          payment.workshop +
          payment.versusBonus;
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help flex items-center gap-1">
                  {totalBonuses > 0 ? (
                    <span className="text-green-600 text-sm">
                      +{formatCurrency(totalBonuses)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                  <HelpCircle className="h-3 w-3 text-muted-foreground opacity-60" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <div className="space-y-1">
                  <div className="font-medium text-xs">Detalle de Bonos:</div>
                  {payment.cover > 0 && (
                    <div className="text-xs">
                      <span className="text-green-600">Cover:</span> +
                      {formatCurrency(payment.cover)}
                    </div>
                  )}
                  {payment.branding > 0 && (
                    <div className="text-xs">
                      <span className="text-green-600">Branding:</span> +
                      {formatCurrency(payment.branding)}
                    </div>
                  )}
                  {payment.themeRide > 0 && (
                    <div className="text-xs">
                      <span className="text-green-600">Theme Ride:</span> +
                      {formatCurrency(payment.themeRide)}
                    </div>
                  )}
                  {payment.workshop > 0 && (
                    <div className="text-xs">
                      <span className="text-green-600">Workshop:</span> +
                      {formatCurrency(payment.workshop)}
                    </div>
                  )}
                  {payment.versusBonus > 0 && (
                    <div className="text-xs">
                      <span className="text-green-600">Versus:</span> +
                      {formatCurrency(payment.versusBonus)}
                    </div>
                  )}
                  {totalBonuses === 0 && (
                    <div className="text-xs text-muted-foreground">
                      Sin bonos aplicados
                    </div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      key: "adjustment",
      title: "Reajuste",
      width: "120px",
      render: (_, payment) => {
        const isEditing = editandoPagoId === payment.id;

        return (
          <div className="text-sm">
            {isEditing ? (
              <ReajusteEditor
                nuevoReajuste={nuevoReajuste}
                setNuevoReajuste={setNuevoReajuste}
                tipoReajuste={tipoReajuste}
                setTipoReajuste={setTipoReajuste}
                isActualizandoReajuste={isActualizandoReajuste}
                pagoId={payment.id}
                actualizarReajuste={actualizarReajuste}
                cancelarEdicionReajuste={cancelarEdicionReajuste}
              />
            ) : (
              <div className="flex items-center gap-1">
                {payment.adjustment > 0 ? (
                  <span className="text-green-600">
                    {payment.adjustmentType === "PERCENTAGE"
                      ? `+${payment.adjustment}%`
                      : `+${formatCurrency(payment.adjustment)}`}
                  </span>
                ) : payment.adjustment < 0 ? (
                  <span className="text-red-600">
                    {payment.adjustmentType === "PERCENTAGE"
                      ? `${payment.adjustment}%`
                      : formatCurrency(payment.adjustment)}
                  </span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-5 w-5 p-0"
                  onClick={() => iniciarEdicionReajuste(payment)}
                >
                  <FileText className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "penalty",
      title: "Penalización",
      width: "120px",
      render: (_, payment) => (
        <div className="text-sm">
          {payment.penalty > 0 ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help flex flex-col">
                    <span className="text-red-600 text-sm">
                      -{formatCurrency(payment.penalty)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      ({((payment.penalty / payment.amount) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <div className="space-y-2">
                    <div className="font-medium text-xs">
                      Detalle de Penalización:
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Penalización aplicada: {formatCurrency(payment.penalty)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Porcentaje:{" "}
                      {((payment.penalty / payment.amount) * 100).toFixed(1)}%
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      ),
    },
    {
      key: "retention",
      title: "Retención",
      width: "120px",
      render: (_, payment) => (
        <div className="text-sm">
          {payment.retention > 0 ? (
            <span className="text-red-600">
              -{formatCurrency(payment.retention)}
            </span>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      ),
    },
    {
      key: "finalPayment",
      title: "Total",
      width: "120px",
      render: (_, payment) => (
        <span className="text-sm text-foreground">
          {formatCurrency(payment.finalPayment)}
        </span>
      ),
    },
    {
      key: "status",
      title: "Estado",
      width: "100px",
      render: (_, payment) => {
        const statusConfig: Record<string, { color: string; label: string }> = {
          PENDING: { color: "#f59e0b", label: "Pendiente" },
          PAID: { color: "#10b981", label: "Pagado" },
          CANCELLED: { color: "#ef4444", label: "Cancelado" },
        };

        const config = statusConfig[payment.status] || {
          color: "#6b7280",
          label: payment.status,
        };

        return (
          <Badge
            variant="outline"
            className="text-xs font-medium"
            style={{
              borderColor: config.color,
              color: config.color,
              backgroundColor: `${config.color}1a`,
            }}
          >
            {config.label}
          </Badge>
        );
      },
    },
  ];

  // Acciones de la tabla
  const actions: TableAction<InstructorPayment>[] = [];

  if (canUpdatePayment) {
    actions.push({
      label: "Recalcular",
      icon: <Calculator className="h-3 w-3" />,
      onClick: (payment) => {
        setRecalcTarget({
          instructorId: payment.instructorId,
          periodId: payment.periodId,
          instructorName: payment.instructor.name,
          periodLabel: `P${payment.period.number} - ${payment.period.year}`,
        });
        setRecalcDialogOpen(true);
      },
    });
  }

  if (canReadPayment) {
    actions.push({
      label: "Exportar",
      icon: <FileText className="h-3 w-3" />,
      onClick: (payment) => {
        router.push(`/dashboard/pagos/${payment.id}`);
      },
    });

    actions.push({
      label: "Ver Detalles",
      icon: <Eye className="h-3 w-3" />,
      onClick: (payment) => {
        router.push(`/dashboard/pagos/${payment.id}`);
      },
    });
  }

  if (canUpdatePayment) {
    actions.push({
      label: "Editar Reajuste",
      icon: <FileText className="h-3 w-3" />,
      onClick: (payment) => {
        iniciarEdicionReajuste(payment);
      },
    });
  }

  // Información de paginación
  const paginationInfo = {
    total: totalPayments,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.ceil(totalPayments / pagination.limit),
    hasNext: pagination.page < Math.ceil(totalPayments / pagination.limit),
    hasPrev: pagination.page > 1,
  };

  // Función para limpiar filtros
  const clearFilters = () => {
    setSearchText("");
    setSelectedInstructor("all");
    setSelectedPeriod("all");
    setSelectedStatus("all");
  };

  // Funciones para edición de reajuste
  const iniciarEdicionReajuste = (payment: InstructorPayment) => {
    setEditandoPagoId(payment.id);
    setNuevoReajuste(payment.adjustment);
    setTipoReajuste(
      payment.adjustmentType === "PERCENTAGE" ? "PORCENTAJE" : "FIJO"
    );
  };

  const cancelarEdicionReajuste = () => {
    setEditandoPagoId(null);
    setNuevoReajuste(0);
    setTipoReajuste("FIJO");
  };

  const actualizarReajuste = async (
    pagoId: string,
    valor: number,
    tipo: "FIJO" | "PORCENTAJE"
  ) => {
    setIsActualizandoReajuste(true);
    try {
      const _result = await utils.client.payments.update.mutate({
        id: pagoId,
        adjustment: valor,
        adjustmentType: tipo === "FIJO" ? "FIXED" : "PERCENTAGE",
      });

      await utils.payments.getWithFilters.invalidate();

      toast.success("Reajuste actualizado exitosamente");
      cancelarEdicionReajuste();
    } catch (_error) {
      toast.error("Error al actualizar el reajuste");
    } finally {
      setIsActualizandoReajuste(false);
    }
  };

  // Función para recalcular un pago específico
  const _recalcularPago = async (payment: InstructorPayment) => {
    setRecalculandoPagoId(payment.id);

    try {
      // Recalcular el pago usando la mutación de tRPC
      const result =
        await utils.client.payments.calculateInstructorPayment.mutate({
          instructorId: payment.instructorId,
          periodId: payment.periodId,
        });

      if (result.success) {
        // Invalidar y refrescar los datos
        await utils.payments.getWithFilters.invalidate();
        toast.success("Pago recalculado exitosamente");
      } else {
        toast.error(result.message || "Error al recalcular el pago");
      }
    } catch (error) {
      console.error("Error al recalcular pago:", error);
      toast.error("Error al recalcular el pago");
    } finally {
      setRecalculandoPagoId(null);
    }
  };

  // Función para exportar todos los pagos a Excel
  const handleExportAllPayments = async () => {
    if (!canReadPayment) {
      toast.error("No tienes permisos para exportar pagos");
      return;
    }

    if (selectedPeriod === "all") {
      toast.error("Por favor selecciona un período específico para exportar");
      return;
    }

    toast.info("Obteniendo datos para exportar...");

    // Obtener TODOS los datos del período sin paginación
    const allPaymentsResult = await utils.client.payments.getWithFilters.query({
      limit: 1000, // Límite máximo permitido
      offset: 0,
      search: searchText,
      instructorId:
        selectedInstructor !== "all" ? selectedInstructor : undefined,
      periodId: selectedPeriod,
      status:
        selectedStatus !== "all"
          ? (selectedStatus as "PENDING" | "APPROVED" | "PAID" | "CANCELLED")
          : undefined,
    });

    const allPayments = allPaymentsResult?.payments || [];

    if (allPayments.length === 0) {
      toast.error("No hay datos para exportar");
      return;
    }

    const exportData = allPayments.map((payment: InstructorPayment) => {
      return {
        Instructor: payment.instructor.name,
        Período: `P${payment.period.number} - ${payment.period.year}`,
        "Monto Base": payment.amount.toFixed(2),
        Reajuste: payment.adjustment.toFixed(2),
        "Bono Cover": payment.cover.toFixed(2),
        Branding: payment.branding.toFixed(2),
        "Theme Ride": payment.themeRide.toFixed(2),
        Workshop: payment.workshop.toFixed(2),
        "Versus Bonus": payment.versusBonus.toFixed(2),
        Penalización: payment.penalty.toFixed(2),
        "Retención (8%)": payment.retention.toFixed(2),
        "Pago Final": payment.finalPayment.toFixed(2),
        Estado: payment.status,
        "Fecha Creación": new Date(payment.createdAt).toLocaleDateString(
          "es-CO"
        ),
        "Última Actualización": new Date(payment.updatedAt).toLocaleDateString(
          "es-CO"
        ),
      };
    });

    exportToExcel(exportData, "Pagos_Instructores", "Pagos", {
      columnWidths: [
        20, 15, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 14, 12, 15, 18,
      ],
    });
  };

  if (!canReadPayment) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Acceso Denegado</h2>
          <p className="text-muted-foreground">
            No tienes permisos para ver pagos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pagos</h1>
          <p className="text-sm text-muted-foreground mt-0.5 mr-8">
            Gestiona los pagos de instructores del sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExportAllPayments}
            disabled={selectedPeriod === "all"}
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Exportar Excel
          </Button>
          {canUpdatePayment && (
            <Button
              onClick={() => router.push("/dashboard/pagos/calcular")}
              className="flex items-center gap-2"
            >
              <Calculator className="h-4 w-4" />
              Calcular Pagos
            </Button>
          )}
        </div>
      </div>

      {/* Filtros Compactos */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-3">
          {/* Búsqueda principal */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3.5 w-3.5" />
            <Input
              placeholder="Buscar por instructor..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10 h-8 text-xs"
            />
          </div>
          {/* Selector de período - siempre visible */}
          <div className="w-[200px]">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="h-8 text-xs">
                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los períodos</SelectItem>
                {periods?.map(
                  (period: { id: string; number: number; year: number }) => (
                    <SelectItem key={period.id} value={period.id}>
                      {period.number} - {period.year}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Botón para expandir filtros */}
          <Button
            variant="outline"
            onClick={() => setFiltersExpanded(!filtersExpanded)}
            className="flex items-center gap-2 border-border h-8 text-xs hover:bg-muted hover:text-foreground"
          >
            <Filter className="h-3.5 w-3.5" />
            {filtersExpanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                <span>Ocultar filtros</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                <span>Filtros</span>
              </>
            )}
          </Button>
        </div>

        {/* Filtros expandibles */}
        {filtersExpanded && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Filtro por instructor */}
              <div className="space-y-1">
                <label
                  htmlFor="instructor-select"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Instructor
                </label>
                <Select
                  value={selectedInstructor}
                  onValueChange={setSelectedInstructor}
                >
                  <SelectTrigger id="instructor-select" className="h-8 text-xs">
                    <SelectValue placeholder="Todos los instructores" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los instructores</SelectItem>
                    {instructors?.map((instructor) => (
                      <SelectItem key={instructor.id} value={instructor.id}>
                        {instructor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por estado */}
              <div className="space-y-1">
                <label
                  htmlFor="status-select"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Estado
                </label>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger id="status-select" className="h-8 text-xs">
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="PENDING">Pendiente</SelectItem>
                    <SelectItem value="PAID">Pagado</SelectItem>
                    <SelectItem value="CANCELLED">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Botón para limpiar filtros */}
            <div className="flex justify-end mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground border-border h-7 px-3 text-xs"
              >
                Limpiar filtros
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Tabla con ScrollableTable */}
      <ScrollableTable<InstructorPayment>
        data={payments}
        columns={columns}
        loading={isLoading}
        error={null}
        pagination={paginationInfo}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setLimit}
        actions={actions}
        emptyMessage="No se encontraron pagos"
        emptyIcon={<DollarSign className="h-12 w-12 text-muted-foreground" />}
        tableClassName="compact-table"
      />

      <RecalcularDialog
        isOpen={recalcDialogOpen}
        onClose={() => setRecalcDialogOpen(false)}
        instructorId={recalcTarget?.instructorId || ""}
        periodId={recalcTarget?.periodId || ""}
        instructorName={recalcTarget?.instructorName}
        periodLabel={recalcTarget?.periodLabel}
        onDone={async () => {
          await utils.payments.getWithFilters.invalidate();
        }}
      />
    </div>
  );
}
