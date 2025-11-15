"use client";

import { InstructorListPDF } from "@/components/instructors/pdf/instructor-list-pdf";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useExcelExport } from "@/hooks/useExcelExport";
import { usePDFExport } from "@/hooks/usePDFExport";
import { usePagination } from "@/hooks/usePagination";
import { useRBAC } from "@/hooks/useRBAC";
import type { Instructor as InstructorType } from "@/types";
import { PermissionAction, PermissionResource } from "@/types/rbac";
import { trpc } from "@/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronDown,
  ChevronUp,
  Edit,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  GraduationCap,
  Search,
  Trash2,
} from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const updateInstructorSchema = z.object({
  name: z.string().min(2, "Nombre debe tener al menos 2 caracteres"),
  fullName: z.string().optional(),
  phone: z.string().optional(),
  DNI: z.string().optional(),
  active: z.boolean().optional(),
});

// Extended Instructor type for UI with additional fields
type Instructor = Omit<
  InstructorType,
  "createdAt" | "updatedAt" | "tenantId"
> & {
  createdAt: string;
  updatedAt?: string;
  tenantId?: string;
  disciplines?: Array<{
    name: string;
    color: string | null;
  }>;
  _count?: {
    classes: number;
    payments: number;
  };
};

interface InstructorDialogProps {
  instructor: Instructor;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: z.infer<typeof updateInstructorSchema>) => void;
  isLoading: boolean;
}

function InstructorDialog({
  instructor,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: InstructorDialogProps) {
  const form = useForm({
    resolver: zodResolver(updateInstructorSchema),
    defaultValues: {
      name: instructor.name,
      fullName: instructor.fullName || "",
      phone: instructor.phone || "",
      DNI: instructor.DNI || "",
      active: instructor.active,
    },
  });

  React.useEffect(() => {
    form.reset({
      name: instructor.name,
      fullName: instructor.fullName || "",
      phone: instructor.phone || "",
      DNI: instructor.DNI || "",
      active: instructor.active,
    });
  }, [instructor, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Instructor</DialogTitle>
          <DialogDescription>
            Modifica la información del instructor.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del instructor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nombre completo del instructor"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input placeholder="Número de teléfono" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="DNI"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>DNI</FormLabel>
                  <FormControl>
                    <Input placeholder="Número de DNI" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-6 border-t border-border">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Actualizando..." : "Actualizar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function InstructoresPage() {
  const { hasPermission } = useRBAC();

  // Permisos específicos para instructores
  const canReadInstructor = hasPermission(
    PermissionAction.READ,
    PermissionResource.INSTRUCTOR
  );
  const canUpdateInstructor = hasPermission(
    PermissionAction.UPDATE,
    PermissionResource.INSTRUCTOR
  );
  const canDeleteInstructor = hasPermission(
    PermissionAction.DELETE,
    PermissionResource.INSTRUCTOR
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogInstructor, setDialogInstructor] = useState<Instructor | null>(
    null
  );

  // Estados para filtros
  const [searchText, setSearchText] = useState("");
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Paginación
  const pagination = usePagination({
    defaultLimit: 10,
    defaultPage: 1,
  });

  // Export hooks
  const { exportToExcel } = useExcelExport();
  const { exportToPDF } = usePDFExport();

  // Obtener utils de tRPC
  const utils = trpc.useUtils();

  // Obtener datos para filtros
  const { data: disciplines } = trpc.disciplines.getAll.useQuery();

  // Obtener instructores con filtros usando tRPC
  const { data: instructorsData, isLoading } =
    trpc.instructor.getWithFilters.useQuery({
      limit: pagination.limit,
      offset: (pagination.page - 1) * pagination.limit,
      search: searchText,
      discipline: selectedDiscipline !== "all" ? selectedDiscipline : undefined,
      active:
        selectedStatus === "active"
          ? true
          : selectedStatus === "inactive"
            ? false
            : undefined,
    });

  const instructors = instructorsData?.instructors || [];
  const totalInstructors = instructorsData?.total || 0;

  // Mutaciones tRPC
  const updateInstructor = trpc.instructor.update.useMutation({
    onSuccess: () => {
      utils.instructor.getWithFilters.invalidate();
      handleDialogClose();
    },
  });

  const deleteInstructor = trpc.instructor.delete.useMutation({
    onSuccess: () => {
      utils.instructor.getWithFilters.invalidate();
    },
  });

  // Handlers
  const handleEdit = (instructor: Instructor) => {
    setDialogInstructor(instructor);
    setIsDialogOpen(true);
  };

  const handleView = (instructor: Instructor) => {
    // Navegar a la página de detalle del instructor
    window.location.href = `/dashboard/instructores/${instructor.id}`;
  };

  const handleDelete = (instructor: Instructor) => {
    if (
      confirm(`¿Estás seguro de que quieres eliminar a ${instructor.name}?`)
    ) {
      deleteInstructor.mutate({ id: instructor.id });
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setDialogInstructor(null);
  };

  const handleDialogSubmit = (data: z.infer<typeof updateInstructorSchema>) => {
    if (!dialogInstructor) return;

    // Actualizar instructor existente
    updateInstructor.mutate({
      id: dialogInstructor.id,
      ...data,
    });
  };

  // Limpiar filtros
  const clearFilters = () => {
    setSearchText("");
    setSelectedDiscipline("all");
    setSelectedStatus("all");
  };

  // Toggle para expandir/contraer filtros
  const toggleFilters = () => {
    setFiltersExpanded(!filtersExpanded);
  };

  // Definir columnas de la tabla
  const columns: TableColumn<Instructor>[] = [
    {
      key: "name",
      title: "Instructor",
      render: (_, record) => (
        <div className="text-sm font-medium text-foreground">{record.name}</div>
      ),
    },
    {
      key: "disciplines",
      title: "Disciplinas",
      render: (_, record) => (
        <div className="flex flex-wrap gap-1">
          {record.disciplines?.map((discipline, index) => (
            <Badge
              key={`${discipline.name}-${index}`}
              variant="outline"
              className="text-xs font-medium"
              style={{
                borderColor: discipline.color || "#6b7280",
                color: discipline.color || "#6b7280",
                backgroundColor: `${discipline.color || "#6b7280"}1a`,
              }}
            >
              {discipline.name}
            </Badge>
          )) || (
            <span className="text-sm text-muted-foreground">
              Sin disciplinas
            </span>
          )}
        </div>
      ),
    },
    {
      key: "_count",
      title: "Estadísticas",
      render: (_, record) => (
        <div className="text-sm text-muted-foreground">
          <div>Clases: {record._count?.classes || 0}</div>
          <div>Pagos: {record._count?.payments || 0}</div>
        </div>
      ),
    },
    {
      key: "active",
      title: "Estado",
      render: (value) => (
        <Badge
          variant="secondary"
          className={`text-xs font-medium ${
            value
              ? "bg-green-100 text-green-800 hover:bg-green-200"
              : "bg-red-100 text-red-800 hover:bg-red-200"
          }`}
        >
          {value ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      title: "Creado",
      render: (value) => new Date(value as string).toLocaleDateString(),
      className: "text-sm text-muted-foreground",
    },
  ];

  // Definir acciones de la tabla
  const actions: TableAction<Instructor>[] = [];

  if (canReadInstructor) {
    actions.push({
      label: "Ver Detalles",
      icon: <Eye className="h-4 w-4" />,
      onClick: handleView,
      variant: "edit-secondary",
    });
  }

  if (canUpdateInstructor) {
    actions.push({
      label: "Editar",
      icon: <Edit className="h-4 w-4" />,
      onClick: handleEdit,
      variant: "edit",
    });
  }

  if (canDeleteInstructor) {
    actions.push({
      label: "Eliminar",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleDelete,
      variant: "destructive",
      separator: true,
    });
  }

  // Información de paginación
  const paginationInfo = {
    page: pagination.page,
    limit: pagination.limit,
    total: totalInstructors,
    totalPages: Math.ceil(totalInstructors / pagination.limit),
    hasNext: pagination.page < Math.ceil(totalInstructors / pagination.limit),
    hasPrev: pagination.page > 1,
  };

  // Export handlers
  const handleExportExcel = async () => {
    if (instructors.length === 0) {
      toast.error("No hay datos para exportar");
      return;
    }

    toast.info("Obteniendo datos para exportar...");

    // Obtener TODOS los instructores sin paginación
    const allInstructorsData = await utils.client.instructor.getAll.query();

    const allInstructors = allInstructorsData?.instructors || [];

    if (allInstructors.length === 0) {
      toast.error("No hay datos para exportar");
      return;
    }

    const exportData = allInstructors.map(
      (instructor: {
        name: string;
        fullName: string | null;
        phone: string | null;
        DNI: string | null;
        active: boolean;
        createdAt: string;
        disciplines?: Array<{ name: string }>;
        classes?: Array<unknown>;
        payments?: Array<unknown>;
      }) => ({
        Nombre: instructor.name,
        "Nombre Completo": instructor.fullName || "N/A",
        Teléfono: instructor.phone || "N/A",
        DNI: instructor.DNI || "N/A",
        Disciplinas:
          instructor.disciplines?.map((d) => d.name).join(", ") || "N/A",
        "Total Clases": instructor.classes?.length || 0,
        "Total Pagos": instructor.payments?.length || 0,
        Estado: instructor.active ? "Activo" : "Inactivo",
        "Fecha Creación": new Date(instructor.createdAt).toLocaleDateString(
          "es-CO"
        ),
      })
    );

    exportToExcel(exportData, "Instructores", "Instructores", {
      columnWidths: [20, 25, 15, 12, 30, 12, 12, 10, 15],
    });
  };

  const handleExportPDF = async () => {
    if (instructors.length === 0) {
      toast.error("No hay datos para exportar");
      return;
    }

    toast.info("Obteniendo datos para exportar...");

    // Obtener TODOS los instructores sin paginación
    const allInstructorsData = await utils.client.instructor.getAll.query();

    const allInstructors = allInstructorsData?.instructors || [];

    if (allInstructors.length === 0) {
      toast.error("No hay datos para exportar");
      return;
    }

    await exportToPDF(
      <InstructorListPDF
        instructors={allInstructors}
        totalCount={allInstructors.length}
      />,
      "Listado_Instructores"
    );
  };

  if (!canReadInstructor) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Acceso Denegado</h2>
          <p className="text-muted-foreground">
            No tienes permisos para ver instructores.
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
          <h1 className="text-2xl font-bold text-foreground">Instructores</h1>
          <p className="text-sm text-muted-foreground mt-0.5 mr-8">
            Administra instructores del sistema y sus especialidades
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canReadInstructor && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={instructors.length === 0}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-1.5" />
                  Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportExcel}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Exportar a Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPDF}>
                  <FileText className="mr-2 h-4 w-4" />
                  Exportar a PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
              placeholder="Buscar por nombre, teléfono, DNI..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10 h-8 text-xs"
            />
          </div>

          {/* Botón para expandir filtros */}
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

        {/* Filtros expandibles */}
        {filtersExpanded && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Filtro por disciplina */}
              <div className="space-y-1">
                <label
                  htmlFor="discipline-select"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Disciplina
                </label>
                <Select
                  value={selectedDiscipline}
                  onValueChange={setSelectedDiscipline}
                >
                  <SelectTrigger id="discipline-select" className="h-8 text-xs">
                    <SelectValue placeholder="Todas las disciplinas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las disciplinas</SelectItem>
                    {disciplines?.disciplines?.map((discipline) => (
                      <SelectItem key={discipline.id} value={discipline.id}>
                        {discipline.name}
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
                    <SelectItem value="active">Activos</SelectItem>
                    <SelectItem value="inactive">Inactivos</SelectItem>
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
      <ScrollableTable<Instructor>
        data={instructors}
        columns={columns}
        loading={isLoading}
        error={null}
        pagination={paginationInfo}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setLimit}
        actions={actions}
        emptyMessage="No se encontraron instructores"
        emptyIcon={
          <GraduationCap className="h-12 w-12 text-muted-foreground" />
        }
      />

      {/* Dialog para editar instructor */}
      {dialogInstructor && (
        <InstructorDialog
          instructor={dialogInstructor}
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
          onSubmit={handleDialogSubmit}
          isLoading={updateInstructor.isPending}
        />
      )}
    </div>
  );
}
