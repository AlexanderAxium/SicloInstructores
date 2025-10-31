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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useExcelExport } from "@/hooks/useExcelExport";
import { usePagination } from "@/hooks/usePagination";
import { useRBAC } from "@/hooks/useRBAC";
import type { ThemeRide as ThemeRideType } from "@/types";
import { PermissionAction, PermissionResource } from "@/types/rbac";
import { trpc } from "@/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Bike,
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

const updateThemeRideSchema = z.object({
  number: z.number().min(1, "El número debe ser mayor a 0"),
  instructorId: z.string().min(1, "Instructor es requerido"),
  periodId: z.string().min(1, "Período es requerido"),
  comments: z.string().optional(),
});

const createThemeRideSchema = z.object({
  number: z.number().min(1, "El número debe ser mayor a 0"),
  instructorId: z.string().min(1, "Instructor es requerido"),
  periodId: z.string().min(1, "Período es requerido"),
  comments: z.string().optional(),
});

// Extended ThemeRide type for UI
type ThemeRide = Omit<ThemeRideType, "createdAt" | "updatedAt" | "tenantId"> & {
  createdAt: string;
  updatedAt: string;
  tenantId?: string;
  instructor: {
    id: string;
    name: string;
  };
  period: {
    id: string;
    number: number;
    year: number;
  };
};

interface ThemeRideDialogProps {
  themeRideData: ThemeRide | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data:
      | z.infer<typeof updateThemeRideSchema>
      | z.infer<typeof createThemeRideSchema>
  ) => void;
  isLoading: boolean;
}

function ThemeRideDialog({
  themeRideData,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: ThemeRideDialogProps) {
  const isEdit = !!themeRideData;

  // Obtener datos para los selectores
  const { data: instructorsData } = trpc.instructor.getAll.useQuery();
  const { data: periodsData } = trpc.periods.getAll.useQuery();

  const instructors = instructorsData?.instructors || [];
  const periods = periodsData?.periods || [];

  const form = useForm({
    resolver: zodResolver(
      isEdit ? updateThemeRideSchema : createThemeRideSchema
    ),
    defaultValues: isEdit
      ? {
          number: themeRideData?.number || 1,
          instructorId: themeRideData?.instructorId || "",
          periodId: themeRideData?.periodId || "",
          comments: themeRideData?.comments || "",
        }
      : {
          number: 1,
          instructorId: "",
          periodId: "",
          comments: "",
        },
  });

  // Resetear el formulario cuando cambie el theme ride
  useEffect(() => {
    if (themeRideData) {
      form.reset({
        number: themeRideData.number,
        instructorId: themeRideData.instructorId,
        periodId: themeRideData.periodId,
        comments: themeRideData.comments || "",
      });
    } else {
      form.reset({
        number: 1,
        instructorId: "",
        periodId: "",
        comments: "",
      });
    }
  }, [themeRideData, form]);

  const handleSubmit = (
    data:
      | z.infer<typeof updateThemeRideSchema>
      | z.infer<typeof createThemeRideSchema>
  ) => {
    onSubmit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar Theme Ride" : "Nuevo Theme Ride"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modifica los datos del theme ride."
              : "Agrega un nuevo theme ride al sistema."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Theme Rides *</FormLabel>
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="instructorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructor *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar instructor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {instructors?.map((instructor) => (
                          <SelectItem key={instructor.id} value={instructor.id}>
                            {instructor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="periodId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Período *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar período" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {periods?.map(
                          (period: {
                            id: string;
                            number: number;
                            year: number;
                          }) => (
                            <SelectItem key={period.id} value={period.id}>
                              {period.number} - {period.year}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comentarios</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Comentarios adicionales (opcional)"
                      {...field}
                    />
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

export default function ThemeRidesPage() {
  const { user: _ } = useAuthContext();
  const { hasPermission } = useRBAC();

  // Permisos específicos para theme rides
  const canReadThemeRide = hasPermission(
    PermissionAction.READ,
    PermissionResource.THEME_RIDE
  );
  const canCreateThemeRide = hasPermission(
    PermissionAction.CREATE,
    PermissionResource.THEME_RIDE
  );
  const canUpdateThemeRide = hasPermission(
    PermissionAction.UPDATE,
    PermissionResource.THEME_RIDE
  );
  const canDeleteThemeRide = hasPermission(
    PermissionAction.DELETE,
    PermissionResource.THEME_RIDE
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogThemeRide, setDialogThemeRide] = useState<ThemeRide | null>(
    null
  );

  // Estados para filtros
  const [searchText, setSearchText] = useState("");
  const [selectedInstructor, setSelectedInstructor] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Paginación
  const pagination = usePagination({
    defaultLimit: 10,
    defaultPage: 1,
  });

  // Export hooks
  const { exportToExcel } = useExcelExport();

  // Obtener datos para filtros
  const { data: instructorsData } = trpc.instructor.getAll.useQuery();
  const { data: periodsData } = trpc.periods.getAll.useQuery();

  const instructors = instructorsData?.instructors || [];
  const periods = periodsData?.periods || [];

  // Obtener theme rides con filtros usando tRPC
  const { data: themeRidesData, isLoading } =
    trpc.themeRides.getWithFilters.useQuery({
      limit: pagination.limit,
      offset: (pagination.page - 1) * pagination.limit,
      search: searchText,
      instructorId:
        selectedInstructor !== "all" ? selectedInstructor : undefined,
      periodId: selectedPeriod !== "all" ? selectedPeriod : undefined,
    });

  const themeRides = themeRidesData?.themeRides || [];
  const totalThemeRides = themeRidesData?.total || 0;

  // Obtener utils de tRPC
  const utils = trpc.useUtils();

  // Mutaciones tRPC
  const createThemeRide = trpc.themeRides.create.useMutation({
    onSuccess: () => {
      utils.themeRides.getWithFilters.invalidate();
      handleDialogClose();
    },
  });

  const updateThemeRide = trpc.themeRides.update.useMutation({
    onSuccess: () => {
      utils.themeRides.getWithFilters.invalidate();
      handleDialogClose();
    },
  });

  const deleteThemeRide = trpc.themeRides.delete.useMutation({
    onSuccess: () => {
      utils.themeRides.getWithFilters.invalidate();
    },
  });

  // Handlers
  const handleCreate = () => {
    setDialogThemeRide(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (themeRideData: ThemeRide) => {
    setDialogThemeRide(themeRideData);
    setIsDialogOpen(true);
  };

  const handleView = (themeRideData: ThemeRide) => {
    // Abrir diálogo de vista
    setDialogThemeRide(themeRideData);
    setIsDialogOpen(true);
  };

  const handleDelete = (themeRideData: ThemeRide) => {
    if (
      confirm(
        `¿Estás seguro de eliminar el theme ride de ${themeRideData.instructor.name}?`
      )
    ) {
      deleteThemeRide.mutate({ id: themeRideData.id });
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setDialogThemeRide(null);
  };

  const handleDialogSubmit = (
    data:
      | z.infer<typeof updateThemeRideSchema>
      | z.infer<typeof createThemeRideSchema>
  ) => {
    if (dialogThemeRide) {
      // Editar theme ride existente
      updateThemeRide.mutate({
        id: dialogThemeRide.id,
        ...data,
      });
    } else {
      // Crear nuevo theme ride
      createThemeRide.mutate(data);
    }
  };

  // Limpiar filtros
  const clearFilters = () => {
    setSearchText("");
    setSelectedInstructor("all");
    setSelectedPeriod("all");
  };

  // Toggle para expandir/contraer filtros
  const toggleFilters = () => {
    setFiltersExpanded(!filtersExpanded);
  };

  // Configuración de columnas para la tabla
  const columns: TableColumn<ThemeRide>[] = [
    {
      key: "number",
      title: "Cantidad",
      width: "100px",
      render: (_, record) => (
        <Badge variant="secondary" className="text-xs">
          {record.number}
        </Badge>
      ),
    },
    {
      key: "instructor",
      title: "Instructor",
      width: "150px",
      render: (_, record) => (
        <span className="text-sm truncate block">{record.instructor.name}</span>
      ),
    },
    {
      key: "period",
      title: "Período",
      width: "120px",
      render: (_, record) => (
        <span className="text-sm">
          {record.period.number} - {record.period.year}
        </span>
      ),
    },
    {
      key: "comments",
      title: "Comentarios",
      width: "200px",
      render: (_, record) => (
        <span className="text-sm text-muted-foreground">
          {record.comments
            ? record.comments.length > 30
              ? `${record.comments.substring(0, 30)}...`
              : record.comments
            : "Sin comentarios"}
        </span>
      ),
    },
  ];

  // Acciones de la tabla
  const actions: TableAction<ThemeRide>[] = [];

  if (canReadThemeRide) {
    actions.push({
      label: "Ver",
      icon: <Eye className="h-4 w-4" />,
      onClick: handleView,
    });
  }

  if (canUpdateThemeRide) {
    actions.push({
      label: "Editar",
      icon: <Edit className="h-4 w-4" />,
      onClick: handleEdit,
    });
  }

  if (canDeleteThemeRide) {
    actions.push({
      label: "Eliminar",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleDelete,
      variant: "destructive",
    });
  }

  // Información de paginación
  const paginationInfo = {
    total: totalThemeRides,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.ceil(totalThemeRides / pagination.limit),
    hasNext: pagination.page * pagination.limit < totalThemeRides,
    hasPrev: pagination.page > 1,
  };

  // Export handler
  const handleExportExcel = async () => {
    if (!canReadThemeRide) {
      toast.error("No tienes permisos para exportar theme rides");
      return;
    }

    if (selectedPeriod === "all") {
      toast.error("Por favor selecciona un período específico para exportar");
      return;
    }

    toast.info("Obteniendo datos para exportar...");

    // Obtener TODOS los datos del período sin paginación
    const allThemeRidesData = await utils.themeRides.getWithFilters.fetch({
      limit: 1000,
      offset: 0,
      search: searchText,
      instructorId:
        selectedInstructor !== "all" ? selectedInstructor : undefined,
      periodId: selectedPeriod,
    });

    const allThemeRides = allThemeRidesData?.themeRides || [];

    if (allThemeRides.length === 0) {
      toast.error("No hay datos para exportar");
      return;
    }

    const exportData = allThemeRides.map((themeRide) => ({
      Número: themeRide.number,
      Instructor: themeRide.instructor.name,
      Período: `P${themeRide.period.number} - ${themeRide.period.year}`,
      Comentarios: themeRide.comments || "",
      "Fecha Creación": new Date(themeRide.createdAt).toLocaleDateString(
        "es-PE"
      ),
    }));

    exportToExcel(exportData, "Theme_Rides", "Theme Rides", {
      columnWidths: [12, 20, 15, 40, 15],
    });
  };

  if (!canReadThemeRide) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Acceso Denegado</h2>
          <p className="text-muted-foreground">
            No tienes permisos para ver theme rides.
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
          <h1 className="text-2xl font-bold text-foreground">Theme Rides</h1>
          <p className="text-sm text-muted-foreground mt-0.5 mr-8">
            Administra los theme rides del sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            disabled={selectedPeriod === "all"}
          >
            <FileSpreadsheet className="h-4 w-4 mr-1.5" />
            Exportar Excel
          </Button>
          {canCreateThemeRide && (
            <Button size="sm" variant="edit" onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-1.5" />
              <span>Nuevo Theme Ride</span>
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
              placeholder="Buscar por instructor, comentarios..."
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

              {/* Filtro por período */}
              <div className="space-y-1">
                <label
                  htmlFor="period-select"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Período
                </label>
                <Select
                  value={selectedPeriod}
                  onValueChange={setSelectedPeriod}
                >
                  <SelectTrigger id="period-select" className="h-8 text-xs">
                    <SelectValue placeholder="Todos los períodos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los períodos</SelectItem>
                    {periods?.map(
                      (period: {
                        id: string;
                        number: number;
                        year: number;
                      }) => (
                        <SelectItem key={period.id} value={period.id}>
                          {period.number} - {period.year}
                        </SelectItem>
                      )
                    )}
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
      <ScrollableTable<ThemeRide>
        data={themeRides}
        columns={columns}
        loading={isLoading}
        error={null}
        pagination={paginationInfo}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setLimit}
        actions={actions}
        emptyMessage="No se encontraron theme rides"
        emptyIcon={<Bike className="h-12 w-12 text-muted-foreground" />}
        tableClassName="compact-table"
      />

      {/* Dialog para crear/editar theme ride */}
      <ThemeRideDialog
        themeRideData={dialogThemeRide}
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleDialogSubmit}
        isLoading={createThemeRide.isPending || updateThemeRide.isPending}
      />
    </div>
  );
}
