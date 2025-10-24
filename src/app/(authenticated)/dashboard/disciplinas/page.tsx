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
import { usePagination } from "@/hooks/usePagination";
import { useRBAC } from "@/hooks/useRBAC";
import { trpc } from "@/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookOpen, Edit, Eye, Palette, Plus, Trash2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const updateDisciplineSchema = z.object({
  name: z.string().min(2, "Nombre debe tener al menos 2 caracteres"),
  description: z.string().optional(),
  color: z.string().optional(),
  active: z.boolean().optional(),
});

const createDisciplineSchema = z.object({
  name: z.string().min(2, "Nombre debe tener al menos 2 caracteres"),
  description: z.string().optional(),
  color: z.string().optional(),
  active: z.boolean().default(true),
});

type Discipline = {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  active: boolean;
  createdAt: string;
  _count?: {
    instructors: number;
    classes: number;
  };
};

interface DisciplineDialogProps {
  discipline: Discipline | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data:
      | z.infer<typeof updateDisciplineSchema>
      | z.infer<typeof createDisciplineSchema>
  ) => void;
  isLoading: boolean;
}

function DisciplineDialog({
  discipline,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: DisciplineDialogProps) {
  const isEditing = discipline !== null;
  const schema = isEditing ? updateDisciplineSchema : createDisciplineSchema;

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: discipline?.name || "",
      description: discipline?.description || "",
      color: discipline?.color || "#6b7280",
      ...(isEditing && { active: discipline?.active ?? true }),
    },
  });

  // Resetear el formulario cuando cambie la disciplina
  useEffect(() => {
    if (discipline) {
      form.reset({
        name: discipline.name,
        description: discipline.description || "",
        color: discipline.color || "#6b7280",
        active: discipline.active,
      });
    } else {
      form.reset({
        name: "",
        description: "",
        color: "#6b7280",
        active: true,
      });
    }
  }, [discipline, form]);

  const handleSubmit = (data: z.infer<typeof schema>) => {
    onSubmit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Disciplina" : "Nueva Disciplina"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica los datos de la disciplina."
              : "Agrega una nueva disciplina al sistema."}
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
                  <FormLabel>Nombre *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Pilates" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Input placeholder="Descripción opcional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        className="w-12 h-8 p-1 border rounded"
                        {...field}
                      />
                      <Input
                        placeholder="#6b7280"
                        className="flex-1"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isEditing && (
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Estado Activo</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Marca si la disciplina está activa
                      </div>
                    </div>
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Guardando..."
                  : isEditing
                    ? "Actualizar"
                    : "Crear"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function DisciplinasPage() {
  const { canManageUsers } = useRBAC();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogDiscipline, setDialogDiscipline] = useState<Discipline | null>(
    null
  );

  // Paginación
  const pagination = usePagination({
    defaultLimit: 10,
    defaultPage: 1,
  });

  // Obtener disciplinas con filtros usando tRPC
  const { data: disciplinesData, isLoading } =
    trpc.disciplines.getWithFilters.useQuery({
      limit: pagination.limit,
      offset: (pagination.page - 1) * pagination.limit,
    });

  const disciplines = disciplinesData?.disciplines || [];
  const totalDisciplines = disciplinesData?.total || 0;

  // Obtener utils de tRPC
  const utils = trpc.useUtils();

  // Mutaciones tRPC
  const createDiscipline = trpc.disciplines.create.useMutation({
    onSuccess: () => {
      // Refrescar la lista de disciplinas
      utils.disciplines.getWithFilters.invalidate();
      handleDialogClose();
    },
  });

  const updateDiscipline = trpc.disciplines.update.useMutation({
    onSuccess: () => {
      // Refrescar la lista de disciplinas
      utils.disciplines.getWithFilters.invalidate();
      handleDialogClose();
    },
  });

  const deleteDiscipline = trpc.disciplines.delete.useMutation({
    onSuccess: () => {
      // Refrescar la lista de disciplinas
      utils.disciplines.getWithFilters.invalidate();
    },
  });

  // Handlers
  const handleCreate = () => {
    setDialogDiscipline(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (discipline: Discipline) => {
    setDialogDiscipline(discipline);
    setIsDialogOpen(true);
  };

  const handleView = (discipline: Discipline) => {
    // Navegar a la página de detalle de la disciplina
    window.location.href = `/dashboard/disciplinas/${discipline.id}`;
  };

  const handleDelete = (discipline: Discipline) => {
    if (
      confirm(`¿Estás seguro de eliminar la disciplina "${discipline.name}"?`)
    ) {
      deleteDiscipline.mutate({ id: discipline.id });
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setDialogDiscipline(null);
  };

  const handleDialogSubmit = (
    data:
      | z.infer<typeof updateDisciplineSchema>
      | z.infer<typeof createDisciplineSchema>
  ) => {
    if (dialogDiscipline) {
      // Editar disciplina existente
      updateDiscipline.mutate({
        id: dialogDiscipline.id,
        ...data,
      });
    } else {
      // Crear nueva disciplina
      createDiscipline.mutate(data);
    }
  };

  // Configuración de columnas para la tabla
  const columns: TableColumn<Discipline>[] = [
    {
      key: "name",
      title: "Nombre",
      width: "200px",
      render: (_, record) => (
        <div className="flex items-center gap-1.5">
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: record.color || "#6b7280" }}
          />
          <span className="font-medium text-sm truncate">{record.name}</span>
        </div>
      ),
    },
    {
      key: "description",
      title: "Descripción",
      width: "250px",
      render: (_, record) => (
        <span className="text-sm text-muted-foreground truncate block">
          {record.description || "Sin descripción"}
        </span>
      ),
    },
    {
      key: "instructors",
      title: "Instructores",
      width: "100px",
      render: (_, record) => (
        <span className="text-sm text-muted-foreground text-center block">
          {record._count?.instructors || 0}
        </span>
      ),
    },
    {
      key: "classes",
      title: "Clases",
      width: "80px",
      render: (_, record) => (
        <span className="text-sm text-muted-foreground text-center block">
          {record._count?.classes || 0}
        </span>
      ),
    },
    {
      key: "active",
      title: "Estado",
      width: "100px",
      render: (_, record) => (
        <Badge
          variant={record.active ? "default" : "secondary"}
          className="text-xs"
        >
          {record.active ? "Activa" : "Inactiva"}
        </Badge>
      ),
    },
  ];

  // Acciones de la tabla
  const actions: TableAction<Discipline>[] = [
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
    total: totalDisciplines,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.ceil(totalDisciplines / pagination.limit),
    hasNext: pagination.page * pagination.limit < totalDisciplines,
    hasPrev: pagination.page > 1,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Disciplinas</h1>
          <p className="text-sm text-muted-foreground mt-0.5 mr-8">
            Administra las disciplinas disponibles en el sistema
          </p>
        </div>
        {canManageUsers && (
          <Button size="sm" variant="edit" onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-1.5" />
            <span>Nueva Disciplina</span>
          </Button>
        )}
      </div>

      {/* Tabla con ScrollableTable */}
      <ScrollableTable<Discipline>
        data={disciplines}
        columns={columns}
        loading={isLoading}
        error={null}
        pagination={paginationInfo}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setLimit}
        actions={actions}
        emptyMessage="No se encontraron disciplinas"
        emptyIcon={<BookOpen className="h-12 w-12 text-muted-foreground" />}
        tableClassName="compact-table"
      />

      {/* Dialog para crear/editar disciplina */}
      <DisciplineDialog
        discipline={dialogDiscipline}
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleDialogSubmit}
        isLoading={createDiscipline.isPending || updateDiscipline.isPending}
      />
    </div>
  );
}
