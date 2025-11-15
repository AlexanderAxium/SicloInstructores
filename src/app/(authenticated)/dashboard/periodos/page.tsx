"use client";

import { useAuthContext } from "@/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type {
  TableAction,
  TableColumn,
} from "@/components/ui/scrollable-table";
import { ScrollableTable } from "@/components/ui/scrollable-table";
import { useExcelExport } from "@/hooks/useExcelExport";
import { usePagination } from "@/hooks/usePagination";
import { useRBAC } from "@/hooks/useRBAC";
import type { PeriodFromAPI } from "@/types/instructor";
import { PermissionAction, PermissionResource } from "@/types/rbac";
import { trpc } from "@/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Edit,
  Eye,
  FileSpreadsheet,
  Filter,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const _updatePeriodSchema = z.object({
  number: z.number().min(1, "El número debe ser mayor a 0"),
  year: z.number().min(2000, "El año debe ser mayor a 2000"),
  startDate: z.string().min(1, "Fecha de inicio es requerida"),
  endDate: z.string().min(1, "Fecha de fin es requerida"),
});

const createPeriodSchema = z.object({
  number: z.number().min(1, "El número debe ser mayor a 0"),
  year: z.number().min(2000, "El año debe ser mayor a 2000"),
  startDate: z.string().min(1, "Fecha de inicio es requerida"),
  endDate: z.string().min(1, "Fecha de fin es requerida"),
  paymentDate: z.string().min(1, "Fecha de pago es requerida"),
});

// Period type is now imported from @/types
// API response type for periods (dates come as strings from API)
// type PeriodFromAPI is now imported from @/types/instructor

// API response type for periods with counts
// type PeriodWithCounts = PeriodFromAPI & {
//   _count: {
//     classes: number;
//     payments: number;
//   };
// };

interface PeriodDialogProps {
  periodData: PeriodFromAPI | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: z.infer<typeof createPeriodSchema>) => void;
  isLoading: boolean;
}

function PeriodDialog({
  periodData,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: PeriodDialogProps) {
  const isEdit = !!periodData;

  const form = useForm<z.infer<typeof createPeriodSchema>>({
    resolver: zodResolver(createPeriodSchema),
    defaultValues: isEdit
      ? {
          number: periodData?.number || 1,
          year: periodData?.year || new Date().getFullYear(),
          startDate: periodData?.startDate
            ? new Date(periodData.startDate).toISOString().split("T")[0]
            : "",
          endDate: periodData?.endDate
            ? new Date(periodData.endDate).toISOString().split("T")[0]
            : "",
          paymentDate: periodData?.paymentDate
            ? new Date(periodData.paymentDate).toISOString().split("T")[0]
            : "",
        }
      : {
          number: 1,
          year: new Date().getFullYear(),
          startDate: "",
          endDate: "",
          paymentDate: "",
        },
  });

  // Resetear el formulario cuando cambie el período
  useEffect(() => {
    if (periodData) {
      form.reset({
        number: periodData.number,
        year: periodData.year,
        startDate: new Date(periodData.startDate).toISOString().split("T")[0],
        endDate: new Date(periodData.endDate).toISOString().split("T")[0],
        paymentDate: new Date(periodData.paymentDate)
          .toISOString()
          .split("T")[0],
      });
    } else {
      form.reset({
        number: 1,
        year: new Date().getFullYear(),
        startDate: "",
        endDate: "",
        paymentDate: "",
      });
    }
  }, [periodData, form]);

  const handleSubmit = (data: z.infer<typeof createPeriodSchema>) => {
    onSubmit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar Período" : "Nuevo Período"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modifica los datos del período."
              : "Agrega un nuevo período al sistema."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number.parseInt(e.target.value) || 1)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Año *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="2000"
                        max="2100"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            Number.parseInt(e.target.value) ||
                              new Date().getFullYear()
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Inicio *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Fin *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="paymentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Pago *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Guardando..." : isEdit ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function PeriodosPage() {
  const { hasPermission } = useRBAC();

  // Permisos específicos para períodos
  const canReadPeriod = hasPermission(
    PermissionAction.READ,
    PermissionResource.PERIODO
  );
  const canCreatePeriod = hasPermission(
    PermissionAction.CREATE,
    PermissionResource.PERIODO
  );
  const canUpdatePeriod = hasPermission(
    PermissionAction.UPDATE,
    PermissionResource.PERIODO
  );
  const canDeletePeriod = hasPermission(
    PermissionAction.DELETE,
    PermissionResource.PERIODO
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogPeriod, setDialogPeriod] = useState<PeriodFromAPI | null>(null);

  // Estados para filtros
  const [searchText, setSearchText] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Paginación
  const pagination = usePagination({
    defaultLimit: 10,
    defaultPage: 1,
  });

  // Export hooks
  const { exportToExcel } = useExcelExport();

  // Obtener períodos con filtros usando tRPC
  const { data: periodsData, isLoading } = trpc.periods.getWithFilters.useQuery(
    {
      limit: pagination.limit,
      offset: (pagination.page - 1) * pagination.limit,
      search: searchText,
      year: selectedYear !== "all" ? Number.parseInt(selectedYear) : undefined,
    }
  );

  const periods: PeriodFromAPI[] = periodsData?.periods || [];
  const totalPeriods = periodsData?.total || 0;

  // Obtener años únicos para el filtro
  const uniqueYears: number[] = [...new Set(periods.map((p) => p.year))].sort(
    (a, b) => b - a
  );

  // Obtener utils de tRPC
  const utils = trpc.useUtils();

  // Mutaciones tRPC
  const createPeriod = trpc.periods.create.useMutation({
    onSuccess: () => {
      utils.periods.getWithFilters.invalidate();
      handleDialogClose();
    },
  });

  const updatePeriod = trpc.periods.update.useMutation({
    onSuccess: () => {
      utils.periods.getWithFilters.invalidate();
      handleDialogClose();
    },
  });

  const deletePeriod = trpc.periods.delete.useMutation({
    onSuccess: () => {
      utils.periods.getWithFilters.invalidate();
    },
  });

  // Handlers
  const handleCreate = () => {
    setDialogPeriod(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (periodData: PeriodFromAPI) => {
    setDialogPeriod(periodData);
    setIsDialogOpen(true);
  };

  const handleView = (periodData: PeriodFromAPI) => {
    // Abrir diálogo de vista
    setDialogPeriod(periodData);
    setIsDialogOpen(true);
  };

  const handleDelete = (periodData: PeriodFromAPI) => {
    if (
      confirm(
        `¿Estás seguro de eliminar el período P${periodData.number} - ${periodData.year}?`
      )
    ) {
      deletePeriod.mutate({ id: periodData.id });
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setDialogPeriod(null);
  };

  const handleDialogSubmit = (data: z.infer<typeof createPeriodSchema>) => {
    if (dialogPeriod) {
      // Editar período existente
      updatePeriod.mutate({
        id: dialogPeriod.id,
        ...data,
      });
    } else {
      // Crear nuevo período
      createPeriod.mutate(data);
    }
  };

  // Limpiar filtros
  const clearFilters = () => {
    setSearchText("");
    setSelectedYear("all");
  };

  // Toggle para expandir/contraer filtros
  const toggleFilters = () => {
    setFiltersExpanded(!filtersExpanded);
  };

  // Configuración de columnas para la tabla
  const columns: TableColumn<PeriodFromAPI>[] = [
    {
      key: "period",
      title: "Período",
      width: "120px",
      render: (_, record) => (
        <div className="font-medium text-sm">
          P{record.number} - {record.year}
        </div>
      ),
    },
    {
      key: "startDate",
      title: "Inicio",
      width: "120px",
      render: (_, record) => (
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm">
            {new Date(record.startDate).toLocaleDateString()}
          </span>
        </div>
      ),
    },
    {
      key: "endDate",
      title: "Fin",
      width: "120px",
      render: (_, record) => (
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm">
            {new Date(record.endDate).toLocaleDateString()}
          </span>
        </div>
      ),
    },
  ];

  // Acciones de la tabla
  const actions: TableAction<PeriodFromAPI>[] = [];

  if (canReadPeriod) {
    actions.push({
      label: "Ver",
      icon: <Eye className="h-4 w-4" />,
      onClick: handleView,
    });
  }

  if (canUpdatePeriod) {
    actions.push({
      label: "Editar",
      icon: <Edit className="h-4 w-4" />,
      onClick: handleEdit,
    });
  }

  if (canDeletePeriod) {
    actions.push({
      label: "Eliminar",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleDelete,
      variant: "destructive",
    });
  }

  // Información de paginación
  const paginationInfo = {
    total: totalPeriods,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.ceil(totalPeriods / pagination.limit),
    hasNext: pagination.page * pagination.limit < totalPeriods,
    hasPrev: pagination.page > 1,
  };

  // Export handler
  const handleExportExcel = async () => {
    if (!canReadPeriod) {
      toast.error("No tienes permisos para exportar períodos");
      return;
    }

    if (periods.length === 0) {
      toast.error("No hay datos para exportar");
      return;
    }

    toast.info("Obteniendo datos para exportar...");

    // Obtener TODOS los períodos sin paginación
    const allPeriodsData = await utils.periods.getAll.fetch({
      limit: 1000,
      offset: 0,
    });

    const allPeriods: PeriodFromAPI[] = allPeriodsData?.periods || [];

    if (allPeriods.length === 0) {
      toast.error("No hay datos para exportar");
      return;
    }

    const exportData = allPeriods.map((period) => ({
      Período: `P${period.number}`,
      Año: period.year,
      "Fecha Inicio": new Date(period.startDate).toLocaleDateString("es-CO"),
      "Fecha Fin": new Date(period.endDate).toLocaleDateString("es-CO"),
      "Fecha Pago": period.paymentDate
        ? new Date(period.paymentDate).toLocaleDateString("es-CO")
        : "",
      "Fecha Creación": new Date(period.createdAt).toLocaleDateString("es-CO"),
    }));

    exportToExcel(exportData, "Periodos", "Períodos", {
      columnWidths: [12, 10, 15, 15, 15, 15, 15, 15],
    });
  };

  if (!canReadPeriod) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Acceso Denegado</h2>
          <p className="text-muted-foreground">
            No tienes permisos para ver períodos.
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
          <h1 className="text-2xl font-bold text-foreground">Períodos</h1>
          <p className="text-sm text-muted-foreground mt-0.5 mr-8">
            Administra los períodos del sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            disabled={periods.length === 0}
          >
            <FileSpreadsheet className="h-4 w-4 mr-1.5" />
            Exportar Excel
          </Button>
          {canCreatePeriod && (
            <Button size="sm" variant="edit" onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-1.5" />
              <span>Nuevo Período</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filtros Compactos */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-3">
          {/* Búsqueda principal */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por número, año..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Botón para expandir filtros */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFilters}
            className="flex items-center gap-2 border-border"
          >
            <Filter className="h-4 w-4" />
            {filtersExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                <span>Ocultar filtros</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                <span>Filtros</span>
              </>
            )}
          </Button>
        </div>

        {/* Filtros expandibles */}
        {filtersExpanded && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
              {/* Filtro por año */}
              <div className="space-y-1">
                <label
                  htmlFor="year-select"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Año
                </label>
                <select
                  id="year-select"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="h-8 w-full px-3 py-1 text-xs border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="all">Todos los años</option>
                  {uniqueYears.map((year) => (
                    <option key={year} value={year.toString()}>
                      {year}
                    </option>
                  ))}
                </select>
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
      <ScrollableTable
        data={periods}
        columns={columns}
        loading={isLoading}
        error={null}
        pagination={paginationInfo}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setLimit}
        actions={actions}
        emptyMessage="No se encontraron períodos"
        emptyIcon={<Calendar className="h-12 w-12 text-muted-foreground" />}
        tableClassName="compact-table"
      />

      {/* Dialog para crear/editar período */}
      <PeriodDialog
        periodData={dialogPeriod}
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleDialogSubmit}
        isLoading={createPeriod.isPending || updatePeriod.isPending}
      />
    </div>
  );
}
