"use client";

import {
  PenaltyDialog,
  type PenaltyFormData,
} from "@/components/penalties/penalty-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type {
  TableAction,
  TableColumn,
} from "@/components/ui/scrollable-table";
import { ScrollableTable } from "@/components/ui/scrollable-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePagination } from "@/hooks/usePagination";
import { useRBAC } from "@/hooks/useRBAC";
import { PermissionAction, PermissionResource } from "@/types/rbac";
import { trpc } from "@/utils/trpc";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  AlertCircle,
  Calendar,
  CalendarIcon,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Edit,
  Eye,
  Filter,
  Plus,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Penalty = {
  id: string;
  instructorId: string;
  disciplineId?: string | null;
  periodId: string;
  type: string;
  points: number;
  description?: string | null;
  active: boolean;
  appliedAt: string;
  comments?: string | null;
  createdAt: string;
  updatedAt: string;
  instructor: {
    id: string;
    name: string;
    fullName?: string | null;
  };
  discipline?: {
    id: string;
    name: string;
    color?: string | null;
  } | null;
  period: {
    id: string;
    number: number;
    year: number;
  };
};

const PENALTY_TYPE_LABELS: Record<string, string> = {
  CANCELLATION_FIXED: "Cancelación Fija",
  CANCELLATION_OUT_OF_TIME: "Cancelación Fuera de Tiempo",
  CANCEL_LESS_24HRS: "Cancelación Menos de 24h",
  COVER_OF_COVER: "Cover de Cover",
  LATE_EXIT: "Salida Tardía",
  LATE_ARRIVAL: "Llegada Tardía",
  CUSTOM: "Personalizada",
};

export default function PenalizacionesPage() {
  const { hasPermission } = useRBAC();

  // Permissions
  const canReadPenalty = hasPermission(
    PermissionAction.READ,
    PermissionResource.PENALIZACION
  );
  const canCreatePenalty = hasPermission(
    PermissionAction.CREATE,
    PermissionResource.PENALIZACION
  );
  const canUpdatePenalty = hasPermission(
    PermissionAction.UPDATE,
    PermissionResource.PENALIZACION
  );
  const canDeletePenalty = hasPermission(
    PermissionAction.DELETE,
    PermissionResource.PENALIZACION
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedPenalty, setSelectedPenalty] = useState<Penalty | null>(null);

  // Filter states
  const [searchText, setSearchText] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedActive, setSelectedActive] = useState<string>("all");
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Pagination
  const pagination = usePagination({
    defaultLimit: 20,
    defaultPage: 1,
  });

  // tRPC utils
  const utils = trpc.useUtils();

  // Get data for filters
  const { data: periodsData } = trpc.periods.getAll.useQuery();

  const periods = periodsData?.periods || [];

  // Get penalties with filters
  const { data: penaltiesData, isLoading } =
    trpc.penalties.getWithFilters.useQuery({
      limit: pagination.limit,
      offset: (pagination.page - 1) * pagination.limit,
      search: searchText || undefined,
      periodId: selectedPeriod !== "all" ? selectedPeriod : undefined,
      type:
        selectedType !== "all"
          ? (selectedType as
              | "CANCELLATION_FIXED"
              | "CANCELLATION_OUT_OF_TIME"
              | "CANCEL_LESS_24HRS"
              | "COVER_OF_COVER"
              | "LATE_EXIT"
              | "LATE_ARRIVAL"
              | "CUSTOM")
          : undefined,
      active:
        selectedActive !== "all" ? selectedActive === "active" : undefined,
    });

  const penalties = (penaltiesData?.penalties || []) as Penalty[];
  const totalPenalties = penaltiesData?.total || 0;

  // Mutations
  const createPenalty = trpc.penalties.create.useMutation({
    onSuccess: () => {
      utils.penalties.getWithFilters.invalidate();
      toast.success("Penalización creada correctamente");
      setIsDialogOpen(false);
      setSelectedPenalty(null);
    },
    onError: (error) => {
      toast.error(error.message || "Error al crear la penalización");
    },
  });

  const updatePenalty = trpc.penalties.update.useMutation({
    onSuccess: () => {
      utils.penalties.getWithFilters.invalidate();
      toast.success("Penalización actualizada correctamente");
      setIsDialogOpen(false);
      setSelectedPenalty(null);
    },
    onError: (error) => {
      toast.error(error.message || "Error al actualizar la penalización");
    },
  });

  const deletePenalty = trpc.penalties.delete.useMutation({
    onSuccess: () => {
      utils.penalties.getWithFilters.invalidate();
      toast.success("Penalización eliminada correctamente");
    },
    onError: (error) => {
      toast.error(error.message || "Error al eliminar la penalización");
    },
  });

  // Handlers
  const handleCreate = () => {
    setSelectedPenalty(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (penalty: Penalty) => {
    setSelectedPenalty(penalty);
    setIsDialogOpen(true);
  };

  const handleView = (penalty: Penalty) => {
    setSelectedPenalty(penalty);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (penalty: Penalty) => {
    if (
      confirm(
        `¿Estás seguro de que quieres eliminar la penalización de ${penalty.instructor.name}?`
      )
    ) {
      deletePenalty.mutate({ id: penalty.id });
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedPenalty(null);
  };

  const handleDialogSubmit = (data: PenaltyFormData) => {
    if (selectedPenalty) {
      updatePenalty.mutate({ id: selectedPenalty.id, ...data });
    } else {
      createPenalty.mutate(data);
    }
  };

  const clearFilters = () => {
    setSearchText("");
    setSelectedPeriod("all");
    setSelectedType("all");
    setSelectedActive("all");
  };

  const toggleFilters = () => {
    setFiltersExpanded(!filtersExpanded);
  };

  // Table columns
  const columns: TableColumn<Penalty>[] = [
    {
      key: "instructor",
      title: "Instructor",
      render: (_, record) => (
        <div className="text-sm font-medium text-foreground">
          {record.instructor?.name || "N/A"}
        </div>
      ),
    },
    {
      key: "type",
      title: "Tipo",
      render: (_, record) => (
        <Badge variant="outline">
          {PENALTY_TYPE_LABELS[record.type] || record.type}
        </Badge>
      ),
    },
    {
      key: "points",
      title: "Puntos",
      render: (_, record) => (
        <div className="text-sm font-semibold text-red-600">
          {record.points}
        </div>
      ),
    },
    {
      key: "discipline",
      title: "Disciplina",
      render: (_, record) =>
        record.discipline ? (
          <Badge
            variant="outline"
            style={{
              borderColor: record.discipline.color || "#6b7280",
              color: record.discipline.color || "#6b7280",
            }}
          >
            {record.discipline.name}
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground">N/A</span>
        ),
    },
    {
      key: "period",
      title: "Período",
      render: (_, record) => (
        <Badge variant="secondary">
          P{record.period?.number || 0}-{record.period?.year || 0}
        </Badge>
      ),
    },
    {
      key: "appliedAt",
      title: "Fecha Aplicada",
      render: (_, record) => (
        <div className="flex items-center gap-1 text-sm">
          <CalendarIcon className="h-3 w-3" />
          {format(new Date(record.appliedAt), "dd/MM/yyyy", { locale: es })}
        </div>
      ),
    },
    {
      key: "active",
      title: "Estado",
      render: (_, record) => (
        <Badge
          variant={record.active ? "default" : "secondary"}
          className={record.active ? "bg-green-600" : ""}
        >
          {record.active ? (
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Activa
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              Inactiva
            </div>
          )}
        </Badge>
      ),
    },
  ];

  // Table actions
  const actions: TableAction<Penalty>[] = [];

  if (canReadPenalty) {
    actions.push({
      label: "Ver Detalles",
      icon: <Eye className="h-4 w-4" />,
      onClick: handleView,
      variant: "edit-secondary",
    });
  }

  if (canUpdatePenalty) {
    actions.push({
      label: "Editar",
      icon: <Edit className="h-4 w-4" />,
      onClick: handleEdit,
      variant: "edit",
    });
  }

  if (canDeletePenalty) {
    actions.push({
      label: "Eliminar",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleDelete,
      variant: "destructive",
      separator: true,
    });
  }

  // Pagination info
  const paginationInfo = {
    page: pagination.page,
    limit: pagination.limit,
    total: totalPenalties,
    totalPages: Math.ceil(totalPenalties / pagination.limit),
    hasNext: pagination.page < Math.ceil(totalPenalties / pagination.limit),
    hasPrev: pagination.page > 1,
  };

  if (!canReadPenalty) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Acceso Denegado</h2>
          <p className="text-muted-foreground">
            No tienes permisos para ver penalizaciones.
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
          <h1 className="text-2xl font-bold text-foreground">Penalizaciones</h1>
          <p className="text-sm text-muted-foreground mt-0.5 mr-8">
            Administra todas las penalizaciones del sistema - gestiona puntos y
            tipos de penalización
          </p>
        </div>
        {canCreatePenalty && (
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Penalización
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3.5 w-3.5" />
            <Input
              placeholder="Buscar penalizaciones..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10 h-8 text-xs"
            />
          </div>

          {/* Period selector */}
          <div className="w-[200px]">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="h-8 text-xs">
                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los períodos</SelectItem>
                {periods.map(
                  (period: { id: string; number: number; year: number }) => (
                    <SelectItem key={period.id} value={period.id}>
                      P{period.number}-{period.year}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Filter toggle */}
          <Button
            variant="outline"
            onClick={toggleFilters}
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

        {/* Expanded filters */}
        {filtersExpanded && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Type filter */}
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Tipo
                </span>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Todos los tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {Object.entries(PENALTY_TYPE_LABELS).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Active filter */}
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Estado
                </span>
                <Select
                  value={selectedActive}
                  onValueChange={setSelectedActive}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Activas</SelectItem>
                    <SelectItem value="inactive">Inactivas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Clear filters button */}
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

      {/* Table */}
      <ScrollableTable<Penalty>
        data={penalties}
        columns={columns}
        loading={isLoading}
        error={null}
        pagination={paginationInfo}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setLimit}
        actions={actions}
        emptyMessage="No se encontraron penalizaciones"
      />

      {/* Create/Edit Dialog */}
      {canCreatePenalty && (
        <PenaltyDialog
          penaltyData={selectedPenalty}
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
          onSubmit={handleDialogSubmit}
          isLoading={createPenalty.isPending || updatePenalty.isPending}
        />
      )}

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Penalización</DialogTitle>
          </DialogHeader>
          {selectedPenalty && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Instructor
                  </span>
                  <p className="font-medium">
                    {selectedPenalty.instructor?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Tipo
                  </span>
                  <p className="font-medium">
                    {PENALTY_TYPE_LABELS[selectedPenalty.type] ||
                      selectedPenalty.type}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Puntos
                  </span>
                  <p className="font-medium text-red-600">
                    {selectedPenalty.points}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Disciplina
                  </span>
                  <p className="font-medium">
                    {selectedPenalty.discipline?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Período
                  </span>
                  <p className="font-medium">
                    P{selectedPenalty.period?.number || 0}-
                    {selectedPenalty.period?.year || 0}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Fecha Aplicada
                  </span>
                  <p className="font-medium">
                    {format(new Date(selectedPenalty.appliedAt), "dd/MM/yyyy", {
                      locale: es,
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Estado
                  </span>
                  <div className="mt-1">
                    <Badge
                      variant={selectedPenalty.active ? "default" : "secondary"}
                      className={selectedPenalty.active ? "bg-green-600" : ""}
                    >
                      {selectedPenalty.active ? "Activa" : "Inactiva"}
                    </Badge>
                  </div>
                </div>
              </div>

              {selectedPenalty.description && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Descripción
                  </span>
                  <p className="mt-1 p-3 bg-muted rounded-md">
                    {selectedPenalty.description}
                  </p>
                </div>
              )}

              {selectedPenalty.comments && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Comentarios
                  </span>
                  <p className="mt-1 p-3 bg-muted rounded-md whitespace-pre-wrap">
                    {selectedPenalty.comments}
                  </p>
                </div>
              )}

              <div className="text-xs text-muted-foreground border-t pt-4">
                <p>
                  Creado:{" "}
                  {selectedPenalty.createdAt
                    ? format(
                        new Date(selectedPenalty.createdAt),
                        "dd/MM/yyyy HH:mm",
                        {
                          locale: es,
                        }
                      )
                    : "N/A"}
                </p>
                {selectedPenalty.updatedAt && (
                  <p>
                    Actualizado:{" "}
                    {format(
                      new Date(selectedPenalty.updatedAt),
                      "dd/MM/yyyy HH:mm",
                      {
                        locale: es,
                      }
                    )}
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
