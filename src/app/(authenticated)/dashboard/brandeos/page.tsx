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
import { usePeriodFilter } from "@/hooks/usePeriodFilter";
import { useRBAC } from "@/hooks/useRBAC";
import { PermissionAction, PermissionResource } from "@/types/rbac";
import { trpc } from "@/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronDown,
  ChevronUp,
  Edit,
  Eye,
  FileSpreadsheet,
  Filter,
  Plus,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const updateBrandeoSchema = z.object({
  number: z.number().min(1, "El número debe ser mayor a 0"),
  instructorId: z.string().min(1, "Instructor es requerido"),
  periodId: z.string().min(1, "Período es requerido"),
  comments: z.string().optional(),
});

const createBrandeoSchema = z.object({
  number: z.number().min(1, "El número debe ser mayor a 0"),
  instructorId: z.string().min(1, "Instructor es requerido"),
  periodId: z.string().min(1, "Período es requerido"),
  comments: z.string().optional(),
});

type Brandeo = {
  id: string;
  number: number;
  instructorId: string;
  periodId: string;
  comments?: string | null;
  createdAt: string;
  updatedAt: string;
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

interface BrandeoDialogProps {
  brandeoData: Brandeo | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data:
      | z.infer<typeof updateBrandeoSchema>
      | z.infer<typeof createBrandeoSchema>
  ) => void;
  isLoading: boolean;
}

function BrandeoDialog({
  brandeoData,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: BrandeoDialogProps) {
  const isEdit = !!brandeoData;

  // Obtener datos para los selectores
  const { data: instructorsData } = trpc.instructor.getAll.useQuery();
  const { data: periodsData } = trpc.periods.getAll.useQuery();

  const instructors = instructorsData?.instructors || [];
  const periods = (periodsData?.periods || []) as Array<{
    id: string;
    number: number;
    year: number;
  }>;

  const form = useForm({
    resolver: zodResolver(isEdit ? updateBrandeoSchema : createBrandeoSchema),
    defaultValues: isEdit
      ? {
          number: brandeoData?.number || 1,
          instructorId: brandeoData?.instructorId || "",
          periodId: brandeoData?.periodId || "",
          comments: brandeoData?.comments || "",
        }
      : {
          number: 1,
          instructorId: "",
          periodId: "",
          comments: "",
        },
  });

  // Resetear el formulario cuando cambie el brandeo
  useEffect(() => {
    if (brandeoData) {
      form.reset({
        number: brandeoData.number,
        instructorId: brandeoData.instructorId,
        periodId: brandeoData.periodId,
        comments: brandeoData.comments || "",
      });
    } else {
      form.reset({
        number: 1,
        instructorId: "",
        periodId: "",
        comments: "",
      });
    }
  }, [brandeoData, form]);

  const handleSubmit = (
    data:
      | z.infer<typeof updateBrandeoSchema>
      | z.infer<typeof createBrandeoSchema>
  ) => {
    onSubmit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar Brandeo" : "Nuevo Brandeo"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modifica los datos del brandeo."
              : "Agrega un nuevo brandeo al sistema."}
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
                  <FormLabel>Número de Brandeos *</FormLabel>
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
                        {periods.map((period) => (
                          <SelectItem key={period.id} value={period.id}>
                            {period.number} - {period.year}
                          </SelectItem>
                        ))}
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

export default function BrandeosPage() {
  const { hasPermission } = useRBAC();

  // Permisos específicos para brandeos
  const canReadBrandeo = hasPermission(
    PermissionAction.READ,
    PermissionResource.BRANDEO
  );
  const canCreateBrandeo = hasPermission(
    PermissionAction.CREATE,
    PermissionResource.BRANDEO
  );
  const canUpdateBrandeo = hasPermission(
    PermissionAction.UPDATE,
    PermissionResource.BRANDEO
  );
  const canDeleteBrandeo = hasPermission(
    PermissionAction.DELETE,
    PermissionResource.BRANDEO
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogBrandeo, setDialogBrandeo] = useState<Brandeo | null>(null);

  // Hook para filtro de periodo compartido
  const { selectedPeriod, setSelectedPeriod } = usePeriodFilter();

  // Estados para filtros
  const [searchText, setSearchText] = useState("");
  const [selectedInstructor, setSelectedInstructor] = useState<string>("all");
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Paginación
  const pagination = usePagination({
    defaultLimit: 10,
    defaultPage: 1,
  });

  // Export hooks
  const { exportToExcel } = useExcelExport();

  // Obtener utils de tRPC
  const utils = trpc.useUtils();

  // Obtener datos para filtros
  const { data: instructorsData } = trpc.instructor.getAll.useQuery();
  const { data: periodsData } = trpc.periods.getAll.useQuery();

  const instructors = instructorsData?.instructors || [];
  const periods = (periodsData?.periods || []) as Array<{
    id: string;
    number: number;
    year: number;
  }>;

  // Obtener brandeos con filtros usando tRPC
  const { data: brandeosData, isLoading } =
    trpc.brandings.getWithFilters.useQuery({
      limit: pagination.limit,
      offset: (pagination.page - 1) * pagination.limit,
      search: searchText,
      instructorId:
        selectedInstructor !== "all" ? selectedInstructor : undefined,
      periodId: selectedPeriod !== "all" ? selectedPeriod : undefined,
    });

  const brandeos = brandeosData?.brandings || [];
  const totalBrandeos = brandeosData?.total || 0;

  // Mutaciones tRPC
  const createBrandeo = trpc.brandings.create.useMutation({
    onSuccess: () => {
      utils.brandings.getWithFilters.invalidate();
      handleDialogClose();
    },
  });

  const updateBrandeo = trpc.brandings.update.useMutation({
    onSuccess: () => {
      utils.brandings.getWithFilters.invalidate();
      handleDialogClose();
    },
  });

  const deleteBrandeo = trpc.brandings.delete.useMutation({
    onSuccess: () => {
      utils.brandings.getWithFilters.invalidate();
    },
  });

  // Handlers
  const handleCreate = () => {
    setDialogBrandeo(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (brandeoData: Brandeo) => {
    setDialogBrandeo(brandeoData);
    setIsDialogOpen(true);
  };

  const handleView = (brandeoData: Brandeo) => {
    // Abrir diálogo de vista
    setDialogBrandeo(brandeoData);
    setIsDialogOpen(true);
  };

  const handleDelete = (brandeoData: Brandeo) => {
    if (
      confirm(
        `¿Estás seguro de eliminar el brandeo de ${brandeoData.instructor.name}?`
      )
    ) {
      deleteBrandeo.mutate({ id: brandeoData.id });
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setDialogBrandeo(null);
  };

  const handleDialogSubmit = (
    data:
      | z.infer<typeof updateBrandeoSchema>
      | z.infer<typeof createBrandeoSchema>
  ) => {
    if (dialogBrandeo) {
      // Editar brandeo existente
      updateBrandeo.mutate({
        id: dialogBrandeo.id,
        ...data,
      });
    } else {
      // Crear nuevo brandeo
      createBrandeo.mutate(data);
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
  const columns: TableColumn<Brandeo>[] = [
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
  const actions: TableAction<Brandeo>[] = [];

  if (canReadBrandeo) {
    actions.push({
      label: "Ver",
      icon: <Eye className="h-4 w-4" />,
      onClick: handleView,
    });
  }

  if (canUpdateBrandeo) {
    actions.push({
      label: "Editar",
      icon: <Edit className="h-4 w-4" />,
      onClick: handleEdit,
    });
  }

  if (canDeleteBrandeo) {
    actions.push({
      label: "Eliminar",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleDelete,
      variant: "destructive",
    });
  }

  // Información de paginación
  const paginationInfo = {
    total: totalBrandeos,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.ceil(totalBrandeos / pagination.limit),
    hasNext: pagination.page * pagination.limit < totalBrandeos,
    hasPrev: pagination.page > 1,
  };

  // Export handler
  const handleExportExcel = async () => {
    if (!canReadBrandeo) {
      toast.error("No tienes permisos para exportar brandeos");
      return;
    }

    if (selectedPeriod === "all") {
      toast.error("Por favor selecciona un período específico para exportar");
      return;
    }

    toast.info("Obteniendo datos para exportar...");

    // Obtener TODOS los datos del período sin paginación
    const allBrandeosData = await utils.client.brandings.getWithFilters.query({
      limit: 1000,
      offset: 0,
      search: searchText,
      instructorId:
        selectedInstructor !== "all" ? selectedInstructor : undefined,
      periodId: selectedPeriod,
    });

    const allBrandeos = allBrandeosData?.brandings || [];

    if (allBrandeos.length === 0) {
      toast.error("No hay datos para exportar");
      return;
    }

    const exportData = allBrandeos.map(
      (brandeo: {
        number: number;
        instructor: { name: string };
        period: { number: number; year: number };
        comments: string | null;
        createdAt: string;
      }) => ({
        Número: brandeo.number,
        Instructor: brandeo.instructor.name,
        Período: `P${brandeo.period.number} - ${brandeo.period.year}`,
        Comentarios: brandeo.comments || "",
        "Fecha Creación": new Date(brandeo.createdAt).toLocaleDateString(
          "es-PE"
        ),
      })
    );

    exportToExcel(exportData, "Brandeos", "Brandeos", {
      columnWidths: [12, 20, 15, 40, 15],
    });
  };

  if (!canReadBrandeo) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Acceso Denegado</h2>
          <p className="text-muted-foreground">
            No tienes permisos para ver brandeos.
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
          <h1 className="text-2xl font-bold text-foreground">Brandeos</h1>
          <p className="text-sm text-muted-foreground mt-0.5 mr-8">
            Administra los brandeos del sistema
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
          {canCreateBrandeo && (
            <Button size="sm" variant="edit" onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-1.5" />
              <span>Nuevo Brandeo</span>
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

          {/* Selector de período - siempre visible */}
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[200px]">
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
      <ScrollableTable<Brandeo>
        data={brandeos}
        columns={columns}
        loading={isLoading}
        error={null}
        pagination={paginationInfo}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setLimit}
        actions={actions}
        emptyMessage="No se encontraron brandeos"
        emptyIcon={<Star className="h-12 w-12 text-muted-foreground" />}
        tableClassName="compact-table"
      />

      {/* Dialog para crear/editar brandeo */}
      <BrandeoDialog
        brandeoData={dialogBrandeo}
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleDialogSubmit}
        isLoading={createBrandeo.isPending || updateBrandeo.isPending}
      />
    </div>
  );
}
