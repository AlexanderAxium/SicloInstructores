"use client";

import { CoverDialog } from "@/components/covers/cover-dialog";
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
import { useInstructorAuth } from "@/contexts/InstructorAuthContext";
import { usePagination } from "@/hooks/usePagination";
import type {
  CoverFromAPI,
  CreateCoverData,
  UpdateCoverData,
} from "@/types/covers";
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
  Clock,
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

type Cover = CoverFromAPI & {
  originalInstructor: {
    id: string;
    name: string;
    fullName?: string | null;
  };
  replacementInstructor: {
    id: string;
    name: string;
    fullName?: string | null;
  };
  discipline: {
    id: string;
    name: string;
    color?: string | null;
  };
  period: {
    id: string;
    number: number;
    year: number;
  };
  class?: {
    id: string;
    date: string | Date;
    studio: string;
    room: string;
    discipline?: {
      name: string;
      color?: string | null;
    };
  } | null;
};

export default function InstructorCoversPage() {
  const { instructor } = useInstructorAuth();
  const instructorId = instructor?.id;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedCover, setSelectedCover] = useState<Cover | null>(null);

  // Filter states
  const [searchText, setSearchText] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [selectedJustification, setSelectedJustification] =
    useState<string>("all");
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

  const periods: Array<{ id: string; number: number; year: number }> =
    periodsData?.periods || [];

  // Get my replacement covers
  const { data: coversData, isLoading } =
    trpc.covers.getMyReplacementCovers.useQuery(
      {
        limit: pagination.limit,
        offset: (pagination.page - 1) * pagination.limit,
        search: searchText || undefined,
        periodId: selectedPeriod !== "all" ? selectedPeriod : undefined,
        justification:
          selectedJustification !== "all"
            ? (selectedJustification as "PENDING" | "APPROVED" | "REJECTED")
            : undefined,
      },
      {
        enabled: !!instructorId,
      }
    );

  const covers = (coversData?.covers || []) as Cover[];
  const totalCovers = coversData?.total || 0;

  // Mutations
  const createCover = trpc.covers.create.useMutation({
    onSuccess: () => {
      utils.covers.getMyReplacementCovers.invalidate();
      toast.success("Cover creado correctamente");
      setIsDialogOpen(false);
      setSelectedCover(null);
    },
    onError: (error) => {
      toast.error(error.message || "Error al crear el cover");
    },
  });

  const updateCover = trpc.covers.update.useMutation({
    onSuccess: () => {
      utils.covers.getMyReplacementCovers.invalidate();
      toast.success("Cover actualizado correctamente");
      setIsDialogOpen(false);
      setSelectedCover(null);
    },
    onError: (error) => {
      toast.error(error.message || "Error al actualizar el cover");
    },
  });

  const deleteCover = trpc.covers.delete.useMutation({
    onSuccess: () => {
      utils.covers.getMyReplacementCovers.invalidate();
      toast.success("Cover eliminado correctamente");
    },
    onError: (error) => {
      toast.error(error.message || "Error al eliminar el cover");
    },
  });

  // Handlers
  const handleCreate = () => {
    setSelectedCover(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (cover: Cover) => {
    setSelectedCover(cover);
    setIsDialogOpen(true);
  };

  const handleView = (cover: Cover) => {
    setSelectedCover(cover);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (cover: Cover) => {
    if (confirm("¿Estás seguro de que quieres eliminar este cover?")) {
      deleteCover.mutate({ id: cover.id });
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedCover(null);
  };

  const handleDialogSubmit = (data: CreateCoverData | UpdateCoverData) => {
    if (selectedCover) {
      // Update
      updateCover.mutate(data as UpdateCoverData);
    } else {
      // Create - ensure replacement instructor is set
      if (instructorId) {
        createCover.mutate({
          ...(data as CreateCoverData),
          replacementInstructorId: instructorId,
        });
      }
    }
  };

  const clearFilters = () => {
    setSearchText("");
    setSelectedPeriod("all");
    setSelectedJustification("all");
  };

  const toggleFilters = () => {
    setFiltersExpanded(!filtersExpanded);
  };

  // Get justification badge
  const getJustificationBadge = (justification: string) => {
    const configs = {
      PENDING: {
        variant: "outline" as const,
        icon: AlertCircle,
        color: "text-yellow-600",
        label: "Pendiente",
      },
      APPROVED: {
        variant: "default" as const,
        icon: CheckCircle,
        color: "text-green-600",
        label: "Aprobado",
      },
      REJECTED: {
        variant: "destructive" as const,
        icon: XCircle,
        color: "text-red-600",
        label: "Rechazado",
      },
    };

    const config =
      configs[justification as keyof typeof configs] || configs.PENDING;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  // Table columns
  const columns: TableColumn<Cover>[] = [
    {
      key: "originalInstructor",
      title: "Instructor Original",
      render: (_, record) => (
        <div className="text-sm font-medium text-foreground">
          {record.originalInstructor?.name || "N/A"}
        </div>
      ),
    },
    {
      key: "discipline",
      title: "Disciplina",
      render: (_, record) => (
        <Badge
          variant="outline"
          style={{
            borderColor: record.discipline?.color || "#6b7280",
            color: record.discipline?.color || "#6b7280",
          }}
        >
          {record.discipline?.name || "N/A"}
        </Badge>
      ),
    },
    {
      key: "date",
      title: "Fecha",
      render: (_, record) => (
        <div className="flex items-center gap-1 text-sm">
          <CalendarIcon className="h-3 w-3" />
          {format(new Date(record.date), "dd/MM/yyyy", { locale: es })}
        </div>
      ),
    },
    {
      key: "time",
      title: "Hora",
      render: (_, record) => (
        <div className="flex items-center gap-1 text-sm">
          <Clock className="h-3 w-3" />
          {record.time}
        </div>
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
      key: "justification",
      title: "Estado",
      render: (_, record) => getJustificationBadge(record.justification),
    },
    {
      key: "bonusPayment",
      title: "Pago COP 80",
      render: (_, record) => (
        <div className="text-center">
          {record.justification === "PENDING" ? (
            <Badge variant="outline" className="text-xs">
              Pendiente
            </Badge>
          ) : record.bonusPayment ? (
            <Badge variant="default" className="text-xs bg-green-600">
              COP 80
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs">
              No
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "fullHousePayment",
      title: "Full House",
      render: (_, record) => (
        <div className="text-center">
          {record.justification === "PENDING" ? (
            <Badge variant="outline" className="text-xs">
              Pendiente
            </Badge>
          ) : record.fullHousePayment ? (
            <Badge variant="default" className="text-xs bg-blue-600">
              Full House{record.class?.id ? ` - ID: ${record.class.id}` : ""}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs">
              No
            </Badge>
          )}
        </div>
      ),
    },
  ];

  // Table actions
  const actions: TableAction<Cover>[] = [
    {
      label: "Ver Detalles",
      icon: <Eye className="h-4 w-4" />,
      onClick: handleView,
      variant: "edit-secondary",
    },
    {
      label: "Editar",
      icon: <Edit className="h-4 w-4" />,
      onClick: handleEdit,
      variant: "edit",
    },
    {
      label: "Eliminar",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleDelete,
      variant: "destructive",
      separator: true,
    },
  ];

  // Pagination info
  const paginationInfo = {
    page: pagination.page,
    limit: pagination.limit,
    total: totalCovers,
    totalPages: Math.ceil(totalCovers / pagination.limit),
    hasNext: pagination.page < Math.ceil(totalCovers / pagination.limit),
    hasPrev: pagination.page > 1,
  };

  if (!instructorId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Acceso Denegado</h2>
          <p className="text-muted-foreground">
            Debes ser un instructor para ver esta página.
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
          <h1 className="text-2xl font-bold text-foreground">Mis Covers</h1>
          <p className="text-sm text-muted-foreground mt-0.5 mr-8">
            Crea y gestiona los covers que has realizado como instructor
            reemplazo
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Cover
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3.5 w-3.5" />
            <Input
              placeholder="Buscar covers..."
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
                {periods.map((period) => (
                  <SelectItem key={period.id} value={period.id}>
                    P{period.number}-{period.year}
                  </SelectItem>
                ))}
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
              {/* Justification filter */}
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Estado
                </span>
                <Select
                  value={selectedJustification}
                  onValueChange={setSelectedJustification}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="PENDING">Pendiente</SelectItem>
                    <SelectItem value="APPROVED">Aprobado</SelectItem>
                    <SelectItem value="REJECTED">Rechazado</SelectItem>
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
      <ScrollableTable<Cover>
        data={covers}
        columns={columns}
        loading={isLoading}
        error={null}
        pagination={paginationInfo}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setLimit}
        actions={actions}
        emptyMessage="No se encontraron covers"
      />

      {/* Create/Edit Dialog */}
      <CoverDialog
        coverData={selectedCover}
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleDialogSubmit}
        isLoading={createCover.isPending || updateCover.isPending}
        isInstructor={true}
        instructorId={instructorId}
        isAdmin={false}
      />

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Cover</DialogTitle>
          </DialogHeader>
          {selectedCover && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Instructor Original
                  </span>
                  <p className="font-medium">
                    {selectedCover.originalInstructor?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Instructor Reemplazo
                  </span>
                  <p className="font-medium text-blue-600 dark:text-blue-400">
                    {selectedCover.replacementInstructor?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Disciplina
                  </span>
                  <p className="font-medium">
                    {selectedCover.discipline?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Período
                  </span>
                  <p className="font-medium">
                    P{selectedCover.period?.number || 0}-
                    {selectedCover.period?.year || 0}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Fecha
                  </span>
                  <p className="font-medium">
                    {format(new Date(selectedCover.date), "dd/MM/yyyy", {
                      locale: es,
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Hora
                  </span>
                  <p className="font-medium">{selectedCover.time}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Estado
                  </span>
                  <div className="mt-1">
                    {getJustificationBadge(selectedCover.justification)}
                  </div>
                </div>
                {selectedCover.class && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">
                      Clase Enlazada
                    </span>
                    <div className="mt-1">
                      <p className="font-medium">
                        ID: {selectedCover.class.id}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedCover.class.studio} -{" "}
                        {selectedCover.class.room}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <span className="text-sm font-medium text-muted-foreground">
                    Pago COP 80
                  </span>
                  <p className="mt-1">
                    {selectedCover.bonusPayment ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mx-auto" />
                    )}
                  </p>
                </div>
                <div className="text-center">
                  <span className="text-sm font-medium text-muted-foreground">
                    Pago Full House
                  </span>
                  <p className="mt-1">
                    {selectedCover.fullHousePayment ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mx-auto" />
                    )}
                  </p>
                </div>
              </div>

              {(selectedCover.comments || selectedCover.nameChange) && (
                <div className="space-y-4">
                  {selectedCover.nameChange && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">
                        Cambio de Nombre
                      </span>
                      <p className="mt-1 p-3 bg-muted rounded-md">
                        {selectedCover.nameChange}
                      </p>
                    </div>
                  )}
                  {selectedCover.comments && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">
                        Comentarios
                      </span>
                      <p className="mt-1 p-3 bg-muted rounded-md whitespace-pre-wrap">
                        {selectedCover.comments}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="text-xs text-muted-foreground border-t pt-4">
                <p>
                  Creado:{" "}
                  {selectedCover.createdAt
                    ? format(
                        new Date(selectedCover.createdAt),
                        "dd/MM/yyyy HH:mm",
                        {
                          locale: es,
                        }
                      )
                    : "N/A"}
                </p>
                {selectedCover.updatedAt && (
                  <p>
                    Actualizado:{" "}
                    {format(
                      new Date(selectedCover.updatedAt),
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
