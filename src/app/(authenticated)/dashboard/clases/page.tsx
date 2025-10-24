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
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const updateClassSchema = z.object({
  country: z.string().min(1, "País es requerido"),
  city: z.string().min(1, "Ciudad es requerida"),
  studio: z.string().min(1, "Estudio es requerido"),
  room: z.string().min(1, "Sala es requerida"),
  spots: z.number().min(1, "Debe tener al menos 1 cupo"),
  totalReservations: z.number().min(0, "No puede ser negativo"),
  waitingLists: z.number().min(0, "No puede ser negativo"),
  complimentary: z.number().min(0, "No puede ser negativo"),
  paidReservations: z.number().min(0, "No puede ser negativo"),
  specialText: z.string().optional(),
  date: z.string().min(1, "Fecha es requerida"),
  isVersus: z.boolean().default(false),
  versusNumber: z.number().optional(),
});

const createClassSchema = z.object({
  country: z.string().min(1, "País es requerido"),
  city: z.string().min(1, "Ciudad es requerida"),
  studio: z.string().min(1, "Estudio es requerido"),
  room: z.string().min(1, "Sala es requerida"),
  spots: z.number().min(1, "Debe tener al menos 1 cupo"),
  totalReservations: z.number().min(0, "No puede ser negativo"),
  waitingLists: z.number().min(0, "No puede ser negativo"),
  complimentary: z.number().min(0, "No puede ser negativo"),
  paidReservations: z.number().min(0, "No puede ser negativo"),
  specialText: z.string().optional(),
  date: z.string().min(1, "Fecha es requerida"),
  disciplineId: z.string().min(1, "Disciplina es requerida"),
  instructorId: z.string().min(1, "Instructor es requerido"),
  periodId: z.string().min(1, "Período es requerido"),
  week: z.number().min(1, "Semana debe ser mayor a 0"),
  isVersus: z.boolean().default(false),
  versusNumber: z.number().optional(),
});

type Class = {
  id: string;
  country: string;
  city: string;
  disciplineId: string;
  week: number;
  studio: string;
  instructorId: string;
  periodId: string;
  room: string;
  totalReservations: number;
  waitingLists: number;
  complimentary: number;
  spots: number;
  paidReservations: number;
  specialText?: string | null;
  date: string;
  replacementInstructorId?: string | null;
  penaltyType?: string | null;
  penaltyPoints?: number | null;
  isVersus: boolean;
  versusNumber?: number | null;
  createdAt: string;
  updatedAt: string;
  instructor: {
    id: string;
    name: string;
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
  replacementInstructor?: {
    id: string;
    name: string;
  } | null;
};

interface ClassDialogProps {
  classData: Class | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: z.infer<typeof createClassSchema>) => void;
  isLoading: boolean;
}

function ClassDialog({
  classData,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: ClassDialogProps) {
  const isEdit = !!classData;

  // Obtener datos para los selectores
  const { data: disciplinesData } = trpc.disciplines.getAll.useQuery();
  const { data: instructorsData } = trpc.instructor.getAll.useQuery();
  const { data: periodsData } = trpc.periods.getAll.useQuery();

  const disciplines = disciplinesData?.disciplines || [];
  const instructors = instructorsData?.instructors || [];
  const periods = periodsData?.periods || [];

  const form = useForm({
    resolver: zodResolver(createClassSchema),
    defaultValues: isEdit
      ? {
          country: classData?.country || "",
          city: classData?.city || "",
          studio: classData?.studio || "",
          room: classData?.room || "",
          spots: classData?.spots || 0,
          totalReservations: classData?.totalReservations || 0,
          waitingLists: classData?.waitingLists || 0,
          complimentary: classData?.complimentary || 0,
          paidReservations: classData?.paidReservations || 0,
          specialText: classData?.specialText || "",
          date: classData?.date
            ? new Date(classData.date).toISOString().split("T")[0]
            : "",
          isVersus: classData?.isVersus || false,
          versusNumber: classData?.versusNumber || 0,
        }
      : {
          country: "",
          city: "",
          studio: "",
          room: "",
          spots: 0,
          totalReservations: 0,
          waitingLists: 0,
          complimentary: 0,
          paidReservations: 0,
          specialText: "",
          date: "",
          disciplineId: "",
          instructorId: "",
          periodId: "",
          week: 1,
          isVersus: false,
          versusNumber: 0,
        },
  });

  // Resetear el formulario cuando cambie la clase
  useEffect(() => {
    if (classData) {
      form.reset({
        country: classData.country,
        city: classData.city,
        studio: classData.studio,
        room: classData.room,
        spots: classData.spots,
        totalReservations: classData.totalReservations,
        waitingLists: classData.waitingLists,
        complimentary: classData.complimentary,
        paidReservations: classData.paidReservations,
        specialText: classData.specialText || "",
        date: new Date(classData.date).toISOString().split("T")[0],
        isVersus: classData.isVersus,
        versusNumber: classData.versusNumber || 0,
      });
    } else {
      form.reset({
        country: "",
        city: "",
        studio: "",
        room: "",
        spots: 0,
        totalReservations: 0,
        waitingLists: 0,
        complimentary: 0,
        paidReservations: 0,
        specialText: "",
        date: "",
        disciplineId: "",
        instructorId: "",
        periodId: "",
        week: 1,
        isVersus: false,
        versusNumber: 0,
      });
    }
  }, [classData, form]);

  const handleSubmit = (data: z.infer<typeof createClassSchema>) => {
    onSubmit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Clase" : "Nueva Clase"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modifica los datos de la clase."
              : "Agrega una nueva clase al sistema."}
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
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>País *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Perú" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ciudad *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Lima" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="studio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estudio *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Studio 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="room"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sala *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Sala A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {!isEdit && (
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="disciplineId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Disciplina *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar disciplina" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {disciplines?.map((discipline) => (
                            <SelectItem
                              key={discipline.id}
                              value={discipline.id}
                            >
                              {discipline.name}
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
                  name="instructorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instructor *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar instructor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {instructors?.map((instructor) => (
                            <SelectItem
                              key={instructor.id}
                              value={instructor.id}
                            >
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
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
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
            )}

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

              {!isEdit && (
                <FormField
                  control={form.control}
                  name="week"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Semana *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(Number.parseInt(e.target.value) || 1)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="spots"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cupos *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number.parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalReservations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reservas Totales</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number.parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="waitingLists"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lista de Espera</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number.parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="complimentary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cortesías</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number.parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paidReservations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reservas Pagadas</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number.parseInt(e.target.value))
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
              name="specialText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Texto Especial</FormLabel>
                  <FormControl>
                    <Input placeholder="Texto especial opcional" {...field} />
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

export default function ClasesPage() {
  const { user: _ } = useAuthContext();
  const { canManageUsers } = useRBAC();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogClass, setDialogClass] = useState<Class | null>(null);

  // Estados para filtros
  const [searchText, setSearchText] = useState("");
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>("all");
  const [selectedInstructor, setSelectedInstructor] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Paginación
  const pagination = usePagination({
    defaultLimit: 10,
    defaultPage: 1,
  });

  // Obtener datos para filtros
  const { data: disciplinesData } = trpc.disciplines.getAll.useQuery();
  const { data: instructorsData } = trpc.instructor.getAll.useQuery();
  const { data: periodsData } = trpc.periods.getAll.useQuery();

  const disciplines = disciplinesData?.disciplines || [];
  const instructors = instructorsData?.instructors || [];
  const periods = periodsData?.periods || [];

  // Obtener clases con filtros usando tRPC
  const { data: classesData, isLoading } = trpc.classes.getWithFilters.useQuery(
    {
      limit: pagination.limit,
      offset: (pagination.page - 1) * pagination.limit,
      search: searchText,
      disciplineId:
        selectedDiscipline !== "all" ? selectedDiscipline : undefined,
      instructorId:
        selectedInstructor !== "all" ? selectedInstructor : undefined,
      periodId: selectedPeriod !== "all" ? selectedPeriod : undefined,
      studio: selectedCountry !== "all" ? selectedCountry : undefined,
    }
  );

  const classes = classesData?.classes || [];
  const totalClasses = classesData?.total || 0;

  // Obtener utils de tRPC
  const utils = trpc.useUtils();

  // Mutaciones tRPC
  const createClass = trpc.classes.create.useMutation({
    onSuccess: () => {
      utils.classes.getWithFilters.invalidate();
      handleDialogClose();
    },
  });

  const updateClass = trpc.classes.update.useMutation({
    onSuccess: () => {
      utils.classes.getWithFilters.invalidate();
      handleDialogClose();
    },
  });

  const deleteClass = trpc.classes.delete.useMutation({
    onSuccess: () => {
      utils.classes.getWithFilters.invalidate();
    },
  });

  // Handlers
  const handleCreate = () => {
    setDialogClass(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (classData: Class) => {
    setDialogClass(classData);
    setIsDialogOpen(true);
  };

  const handleView = (classData: Class) => {
    // Navegar a la página de detalle de la clase
    window.location.href = `/dashboard/clases/${classData.id}`;
  };

  const handleDelete = (classData: Class) => {
    if (
      confirm(
        `¿Estás seguro de eliminar la clase del ${new Date(classData.date).toLocaleDateString()}?`
      )
    ) {
      deleteClass.mutate({ id: classData.id });
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setDialogClass(null);
  };

  const handleDialogSubmit = (
    data: z.infer<typeof updateClassSchema> | z.infer<typeof createClassSchema>
  ) => {
    if (dialogClass) {
      // Editar clase existente
      updateClass.mutate({
        id: dialogClass.id,
        ...data,
      });
    } else {
      // Crear nueva clase - asegurar que data tiene los campos requeridos
      if (
        "disciplineId" in data &&
        "instructorId" in data &&
        "periodId" in data &&
        "week" in data
      ) {
        createClass.mutate(data);
      }
    }
  };

  // Limpiar filtros
  const clearFilters = () => {
    setSearchText("");
    setSelectedDiscipline("all");
    setSelectedInstructor("all");
    setSelectedPeriod("all");
    setSelectedCountry("all");
    setSelectedCity("all");
  };

  // Toggle para expandir/contraer filtros
  const toggleFilters = () => {
    setFiltersExpanded(!filtersExpanded);
  };

  // Configuración de columnas para la tabla
  const columns: TableColumn<Class>[] = [
    {
      key: "date",
      title: "Fecha",
      width: "120px",
      render: (_, record) => (
        <span className="text-sm">
          {new Date(record.date).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "discipline",
      title: "Disciplina",
      width: "150px",
      render: (_, record) => (
        <div className="flex items-center gap-1.5">
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: record.discipline.color || "#6b7280" }}
          />
          <span className="font-medium text-sm truncate">
            {record.discipline.name}
          </span>
        </div>
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
      key: "location",
      title: "Ubicación",
      width: "200px",
      render: (_, record) => (
        <div className="text-sm">
          <div className="font-medium">
            {record.studio} - {record.room}
          </div>
          <div className="text-muted-foreground">
            {record.city}, {record.country}
          </div>
        </div>
      ),
    },
    {
      key: "reservations",
      title: "Reservas",
      width: "120px",
      render: (_, record) => (
        <div className="text-sm text-center">
          <div className="font-medium flex items-center justify-center gap-1">
            {record.totalReservations}/{record.spots}
            {record.isVersus && (
              <Badge variant="default" className="text-xs">
                VS
              </Badge>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "week",
      title: "Semana",
      width: "80px",
      render: (_, record) => (
        <span className="text-sm text-center block">{record.week}</span>
      ),
    },
  ];

  // Acciones de la tabla
  const actions: TableAction<Class>[] = [
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
    total: totalClasses,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.ceil(totalClasses / pagination.limit),
    hasNext: pagination.page * pagination.limit < totalClasses,
    hasPrev: pagination.page > 1,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clases</h1>
          <p className="text-sm text-muted-foreground mt-0.5 mr-8">
            Administra las clases del sistema
          </p>
        </div>
        {canManageUsers && (
          <Button size="sm" variant="edit" onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-1.5" />
            <span>Nueva Clase</span>
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
              placeholder="Buscar por instructor, disciplina, estudio..."
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
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
                    {disciplines?.map((discipline) => (
                      <SelectItem key={discipline.id} value={discipline.id}>
                        {discipline.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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

              {/* Filtro por país */}
              <div className="space-y-1">
                <label
                  htmlFor="country-select"
                  className="text-xs font-medium text-muted-foreground"
                >
                  País
                </label>
                <Select
                  value={selectedCountry}
                  onValueChange={setSelectedCountry}
                >
                  <SelectTrigger id="country-select" className="h-8 text-xs">
                    <SelectValue placeholder="Todos los países" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los países</SelectItem>
                    {Array.from(new Set(classes.map((c) => c.country))).map(
                      (country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por ciudad */}
              <div className="space-y-1">
                <label
                  htmlFor="city-select"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Ciudad
                </label>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger id="city-select" className="h-8 text-xs">
                    <SelectValue placeholder="Todas las ciudades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las ciudades</SelectItem>
                    {Array.from(new Set(classes.map((c) => c.city))).map(
                      (city) => (
                        <SelectItem key={city} value={city}>
                          {city}
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
      <ScrollableTable<Class>
        data={classes}
        columns={columns}
        loading={isLoading}
        error={null}
        pagination={paginationInfo}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setLimit}
        actions={actions}
        emptyMessage="No se encontraron clases"
        emptyIcon={<Calendar className="h-12 w-12 text-muted-foreground" />}
        tableClassName="compact-table"
      />

      {/* Dialog para crear/editar clase */}
      <ClassDialog
        classData={dialogClass}
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleDialogSubmit}
        isLoading={createClass.isPending || updateClass.isPending}
      />
    </div>
  );
}
