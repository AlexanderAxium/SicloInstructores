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
import { usePagination } from "@/hooks/usePagination";
import { useRBAC } from "@/hooks/useRBAC";
import { trpc } from "@/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Edit,
  Eye,
  Filter,
  GraduationCap,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const updateWorkshopSchema = z.object({
  name: z.string().min(1, "Nombre es requerido"),
  instructorId: z.string().min(1, "Instructor es requerido"),
  periodId: z.string().min(1, "Período es requerido"),
  date: z.string().min(1, "Fecha es requerida"),
  payment: z.number().min(0, "El pago debe ser mayor o igual a 0"),
  comments: z.string().optional(),
});

const createWorkshopSchema = z.object({
  name: z.string().min(1, "Nombre es requerido"),
  instructorId: z.string().min(1, "Instructor es requerido"),
  periodId: z.string().min(1, "Período es requerido"),
  date: z.string().min(1, "Fecha es requerida"),
  payment: z.number().min(0, "El pago debe ser mayor o igual a 0"),
  comments: z.string().optional(),
});

type Workshop = {
  id: string;
  name: string;
  instructorId: string;
  periodId: string;
  date: string;
  payment: number;
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

interface WorkshopDialogProps {
  workshopData: Workshop | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data:
      | z.infer<typeof updateWorkshopSchema>
      | z.infer<typeof createWorkshopSchema>
  ) => void;
  isLoading: boolean;
}

function WorkshopDialog({
  workshopData,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: WorkshopDialogProps) {
  const isEdit = !!workshopData;

  // Obtener datos para los selectores
  const { data: instructorsData } = trpc.instructor.getAll.useQuery();
  const { data: periodsData } = trpc.periods.getAll.useQuery();

  const instructors = instructorsData?.instructors || [];
  const periods = periodsData?.periods || [];

  const form = useForm({
    resolver: zodResolver(isEdit ? updateWorkshopSchema : createWorkshopSchema),
    defaultValues: isEdit
      ? {
          name: workshopData?.name || "",
          instructorId: workshopData?.instructorId || "",
          periodId: workshopData?.periodId || "",
          date: workshopData?.date
            ? new Date(workshopData.date).toISOString().split("T")[0]
            : "",
          payment: workshopData?.payment || 0,
          comments: workshopData?.comments || "",
        }
      : {
          name: "",
          instructorId: "",
          periodId: "",
          date: "",
          payment: 0,
          comments: "",
        },
  });

  // Resetear el formulario cuando cambie el workshop
  useEffect(() => {
    if (workshopData) {
      form.reset({
        name: workshopData.name,
        instructorId: workshopData.instructorId,
        periodId: workshopData.periodId,
        date: new Date(workshopData.date).toISOString().split("T")[0],
        payment: workshopData.payment,
        comments: workshopData.comments || "",
      });
    } else {
      form.reset({
        name: "",
        instructorId: "",
        periodId: "",
        date: "",
        payment: 0,
        comments: "",
      });
    }
  }, [workshopData, form]);

  const handleSubmit = (
    data:
      | z.infer<typeof updateWorkshopSchema>
      | z.infer<typeof createWorkshopSchema>
  ) => {
    onSubmit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar Workshop" : "Nuevo Workshop"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modifica los datos del workshop."
              : "Agrega un nuevo workshop al sistema."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Workshop *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Workshop de Spinning" {...field} />
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pago (S/) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number.parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
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

export default function WorkshopsPage() {
  const { user: _ } = useAuthContext();
  const { canManageUsers } = useRBAC();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogWorkshop, setDialogWorkshop] = useState<Workshop | null>(null);

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

  // Obtener datos para filtros
  const { data: instructorsData } = trpc.instructor.getAll.useQuery();
  const { data: periodsData } = trpc.periods.getAll.useQuery();

  const instructors = instructorsData?.instructors || [];
  const periods = periodsData?.periods || [];

  // Obtener workshops con filtros usando tRPC
  const { data: workshopsData, isLoading } =
    trpc.workshops.getWithFilters.useQuery({
      limit: pagination.limit,
      offset: (pagination.page - 1) * pagination.limit,
      search: searchText,
      instructorId:
        selectedInstructor !== "all" ? selectedInstructor : undefined,
      periodId: selectedPeriod !== "all" ? selectedPeriod : undefined,
    });

  const workshops = workshopsData?.workshops || [];
  const totalWorkshops = workshopsData?.total || 0;

  // Obtener utils de tRPC
  const utils = trpc.useUtils();

  // Mutaciones tRPC
  const createWorkshop = trpc.workshops.create.useMutation({
    onSuccess: () => {
      utils.workshops.getWithFilters.invalidate();
      handleDialogClose();
    },
  });

  const updateWorkshop = trpc.workshops.update.useMutation({
    onSuccess: () => {
      utils.workshops.getWithFilters.invalidate();
      handleDialogClose();
    },
  });

  const deleteWorkshop = trpc.workshops.delete.useMutation({
    onSuccess: () => {
      utils.workshops.getWithFilters.invalidate();
    },
  });

  // Handlers
  const handleCreate = () => {
    setDialogWorkshop(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (workshopData: Workshop) => {
    setDialogWorkshop(workshopData);
    setIsDialogOpen(true);
  };

  const handleView = (workshopData: Workshop) => {
    // Abrir diálogo de vista
    setDialogWorkshop(workshopData);
    setIsDialogOpen(true);
  };

  const handleDelete = (workshopData: Workshop) => {
    if (
      confirm(`¿Estás seguro de eliminar el workshop "${workshopData.name}"?`)
    ) {
      deleteWorkshop.mutate({ id: workshopData.id });
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setDialogWorkshop(null);
  };

  const handleDialogSubmit = (
    data:
      | z.infer<typeof updateWorkshopSchema>
      | z.infer<typeof createWorkshopSchema>
  ) => {
    if (dialogWorkshop) {
      // Editar workshop existente
      updateWorkshop.mutate({
        id: dialogWorkshop.id,
        ...data,
      });
    } else {
      // Crear nuevo workshop
      createWorkshop.mutate(data);
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
  const columns: TableColumn<Workshop>[] = [
    {
      key: "name",
      title: "Workshop",
      width: "200px",
      render: (_, record) => (
        <div className="font-medium text-sm">{record.name}</div>
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
      key: "date",
      title: "Fecha",
      width: "120px",
      render: (_, record) => (
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm">
            {new Date(record.date).toLocaleDateString()}
          </span>
        </div>
      ),
    },
    {
      key: "payment",
      title: "Pago",
      width: "120px",
      render: (_, record) => (
        <Badge variant="secondary" className="text-xs">
          S/ {record.payment.toFixed(2)}
        </Badge>
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
  const actions: TableAction<Workshop>[] = [
    {
      label: "Ver",
      icon: <Eye className="h-4 w-4" />,
      onClick: handleView,
    },
  ];

  if (canManageUsers) {
    actions.push(
      {
        label: "Editar",
        icon: <Edit className="h-4 w-4" />,
        onClick: handleEdit,
      },
      {
        label: "Eliminar",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: handleDelete,
        variant: "destructive",
      }
    );
  }

  // Información de paginación
  const paginationInfo = {
    total: totalWorkshops,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.ceil(totalWorkshops / pagination.limit),
    hasNext: pagination.page * pagination.limit < totalWorkshops,
    hasPrev: pagination.page > 1,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Workshops</h1>
          <p className="text-sm text-muted-foreground mt-0.5 mr-8">
            Administra los workshops del sistema
          </p>
        </div>
        {canManageUsers && (
          <Button size="sm" variant="edit" onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-1.5" />
            <span>Nuevo Workshop</span>
          </Button>
        )}
      </div>

      {/* Filtros Compactos */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-3">
          {/* Búsqueda principal */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por nombre, instructor, comentarios..."
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
      <ScrollableTable<Workshop>
        data={workshops}
        columns={columns}
        loading={isLoading}
        error={null}
        pagination={paginationInfo}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setLimit}
        actions={actions}
        emptyMessage="No se encontraron workshops"
        emptyIcon={
          <GraduationCap className="h-12 w-12 text-muted-foreground" />
        }
        tableClassName="compact-table"
      />

      {/* Dialog para crear/editar workshop */}
      <WorkshopDialog
        workshopData={dialogWorkshop}
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleDialogSubmit}
        isLoading={createWorkshop.isPending || updateWorkshop.isPending}
      />
    </div>
  );
}
