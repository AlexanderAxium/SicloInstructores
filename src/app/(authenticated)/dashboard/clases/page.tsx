"use client";

import { useAuthContext } from "@/AuthContext";
import { ClassDialog } from "@/components/classes/class-dialog";
import { ClassesListPDF } from "@/components/classes/pdf/classes-list-pdf";
import { VersusDialog } from "@/components/classes/versus-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { usePeriodFilter } from "@/hooks/usePeriodFilter";
import { useRBAC } from "@/hooks/useRBAC";
import type {
  ClassFromAPI,
  ClassWithRelations,
  CreateClassData,
  UpdateClassData,
  VersusClassData,
} from "@/types/classes";
import { PermissionAction, PermissionResource } from "@/types/rbac";
import { trpc } from "@/utils/trpc";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Edit,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

const _updateClassSchema = z.object({
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

const _createClassSchema = z.object({
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

export default function ClasesPage() {
  const { user: _ } = useAuthContext();
  const { hasPermission } = useRBAC();

  // Permisos específicos para clases
  const canReadClass = hasPermission(
    PermissionAction.READ,
    PermissionResource.CLASE
  );
  const canCreateClass = hasPermission(
    PermissionAction.CREATE,
    PermissionResource.CLASE
  );
  const canUpdateClass = hasPermission(
    PermissionAction.UPDATE,
    PermissionResource.CLASE
  );
  const canDeleteClass = hasPermission(
    PermissionAction.DELETE,
    PermissionResource.CLASE
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isVersusDialogOpen, setIsVersusDialogOpen] = useState(false);
  const [dialogClass, setDialogClass] = useState<ClassFromAPI | null>(null);

  // Hook para filtro de periodo compartido
  const { selectedPeriod, setSelectedPeriod } = usePeriodFilter();

  // Estados para filtros
  const [searchText, setSearchText] = useState("");
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>("all");
  const [selectedInstructor, setSelectedInstructor] = useState<string>("all");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Paginación
  const pagination = usePagination({
    defaultLimit: 10,
    defaultPage: 1,
  });

  // Export hooks
  const { exportToExcel } = useExcelExport();
  const { exportToPDF } = usePDFExport();

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
    onError: (error) => {
      console.error("Error creating class:", error);
      toast.error(`Error al crear la clase: ${error.message}`);
    },
  });

  const updateClass = trpc.classes.update.useMutation({
    onSuccess: () => {
      utils.classes.getWithFilters.invalidate();
      handleDialogClose();
    },
    onError: (error) => {
      console.error("Error updating class:", error);
      toast.error(`Error al actualizar la clase: ${error.message}`);
    },
  });

  const deleteClass = trpc.classes.delete.useMutation({
    onSuccess: () => {
      utils.classes.getWithFilters.invalidate();
    },
    onError: (error) => {
      console.error("Error deleting class:", error);
      toast.error(`Error al eliminar la clase: ${error.message}`);
    },
  });

  // Handlers
  const handleCreateSimple = () => {
    setDialogClass(null);
    setIsDialogOpen(true);
  };

  const handleCreateVersus = () => {
    setIsVersusDialogOpen(true);
  };

  const handleEdit = (classData: ClassFromAPI) => {
    setDialogClass(classData);
    setIsDialogOpen(true);
  };

  const handleView = (classData: ClassFromAPI) => {
    // Mostrar información completa de la clase en un modal
    const classInfo = `
📅 INFORMACIÓN DE LA CLASE

🏃 Disciplina: ${classData.discipline.name}
👨‍🏫 Instructor: ${classData.instructor.name}
📅 Fecha: ${new Date(classData.date).toLocaleDateString("es-CO")}
🕐 Hora: ${new Date(classData.date).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
📍 Ubicación: ${classData.studio} - ${classData.room}
🌍 País: ${classData.country}
🏙️ Ciudad: ${classData.city}
📊 Semana: ${classData.week}

📈 MÉTRICAS DE RESERVAS
• Capacidad Total: ${classData.spots}
• Reservas Totales: ${classData.totalReservations}
• Reservas Pagadas: ${classData.paidReservations}
• Lista de Espera: ${classData.waitingLists}
• Cortesías: ${classData.complimentary}
• Ocupación: ${classData.spots > 0 ? Math.round((classData.totalReservations / classData.spots) * 100) : 0}%

${classData.isVersus ? `🏆 CLASE VERSUS #${classData.versusNumber || "N/A"}` : ""}
${classData.specialText ? `📝 Texto Especial: ${classData.specialText}` : ""}
${classData.penaltyType ? `⚠️ Penalización: ${classData.penaltyType} (${classData.penaltyPoints} puntos)` : ""}
${classData.replacementInstructorId ? `🔄 Instructor de Reemplazo: ${classData.replacementInstructorId}` : ""}
    `.trim();

    alert(classInfo);
  };

  const handleDelete = (classData: ClassFromAPI) => {
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

  const handleVersusDialogClose = () => {
    setIsVersusDialogOpen(false);
  };

  const handleVersusDialogSubmit = (data: VersusClassData[]) => {
    console.log("=== DEBUG handleVersusDialogSubmit ===");
    console.log("data:", data);
    console.log("Array.isArray(data):", Array.isArray(data));

    console.log("CREANDO MÚLTIPLES CLASES VERSUS");
    // Crear múltiples clases (versus)

    data.forEach((classData, index) => {
      console.log(`Creando clase ${index + 1}:`, classData);
      createClass.mutate(classData, {
        onSuccess: () => {
          console.log(`Clase ${index + 1} creada exitosamente`);
          utils.classes.getWithFilters.invalidate();
        },
        onError: (error) => {
          console.error(`Error creando clase ${index + 1}:`, error);
          toast.error(`Error al crear las clases versus: ${error.message}`);
          handleVersusDialogClose();
        },
      });
    });

    toast.success(`Creando ${data.length} clases versus...`);
    handleVersusDialogClose();
  };

  const handleDialogSubmit = (
    data: CreateClassData | UpdateClassData | VersusClassData[]
  ) => {
    console.log("=== DEBUG handleDialogSubmit ===");
    console.log("dialogClass:", dialogClass);
    console.log("data:", data);
    console.log("Array.isArray(data):", Array.isArray(data));

    if (dialogClass) {
      // Editar clase existente
      console.log("EDITANDO CLASE EXISTENTE");
      updateClass.mutate({
        id: dialogClass.id,
        ...data,
      });
    } else {
      // Verificar si data es un array (para clases versus)
      if (Array.isArray(data)) {
        console.log("CREANDO MÚLTIPLES CLASES VERSUS");
        // Crear múltiples clases (versus)

        data.forEach((classData, index) => {
          console.log(`Creando clase ${index + 1}:`, classData);
          createClass.mutate(classData, {
            onSuccess: () => {
              console.log(`Clase ${index + 1} creada exitosamente`);
              utils.classes.getWithFilters.invalidate();
            },
            onError: (error) => {
              console.error(`Error creando clase ${index + 1}:`, error);
              toast.error(`Error al crear las clases versus: ${error.message}`);
              handleDialogClose();
            },
          });
        });

        toast.success(`Creando ${data.length} clases versus...`);
        handleDialogClose();
      } else {
        console.log("CREANDO CLASE NORMAL");
        // Crear nueva clase - asegurar que data tiene los campos requeridos
        if (
          "disciplineId" in data &&
          "instructorId" in data &&
          "periodId" in data &&
          "week" in data
        ) {
          console.log("Datos válidos para clase normal:", data);
          createClass.mutate(data);
        } else {
          console.log("ERROR: Datos inválidos para clase normal");
        }
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
  const columns: TableColumn<ClassFromAPI>[] = [
    {
      key: "id",
      title: "ID",
      width: "80px",
      render: (_, record) => (
        <span className="text-xs font-mono text-muted-foreground">
          {record.id}
        </span>
      ),
    },
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
  const actions: TableAction<ClassFromAPI>[] = [];

  // Ver solo si tiene permiso de lectura
  if (canReadClass) {
    actions.push({
      label: "Ver",
      icon: <Eye className="h-4 w-4" />,
      onClick: handleView,
    });
  }

  // Editar y eliminar solo si tiene permisos
  if (canUpdateClass) {
    actions.push({
      label: "Editar",
      icon: <Edit className="h-4 w-4" />,
      onClick: handleEdit,
    });
  }

  if (canDeleteClass) {
    actions.push({
      label: "Eliminar",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleDelete,
      variant: "destructive",
    });
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

  // Export handlers - Solo si tiene permiso de lectura
  const handleExportExcel = async () => {
    if (!canReadClass) {
      toast.error("No tienes permisos para exportar clases");
      return;
    }

    if (selectedPeriod === "all") {
      toast.error("Por favor selecciona un período específico para exportar");
      return;
    }

    toast.info("Obteniendo datos para exportar...");

    // Obtener TODOS los datos del período sin paginación
    const allClassesData = await utils.classes.getWithFilters.fetch({
      limit: 1000, // Límite máximo permitido
      offset: 0,
      search: searchText,
      disciplineId:
        selectedDiscipline !== "all" ? selectedDiscipline : undefined,
      instructorId:
        selectedInstructor !== "all" ? selectedInstructor : undefined,
      periodId: selectedPeriod,
      studio: selectedCountry !== "all" ? selectedCountry : undefined,
    });

    const allClasses = allClassesData?.classes || [];

    if (allClasses.length === 0) {
      toast.error("No hay datos para exportar");
      return;
    }

    const exportData = allClasses.map((clase) => ({
      Fecha: new Date(clase.date).toLocaleDateString("es-CO"),
      Hora: new Date(clase.date).toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      Instructor: clase.instructor.name,
      Disciplina: clase.discipline.name,
      País: clase.country,
      Ciudad: clase.city,
      Estudio: clase.studio,
      Sala: clase.room,
      Semana: clase.week,
      "Capacidad Total": clase.spots,
      "Reservas Totales": clase.totalReservations,
      "Reservas Pagadas": clase.paidReservations,
      Cortesías: clase.complimentary,
      "Lista de Espera": clase.waitingLists,
      "Ocupación %":
        clase.spots > 0
          ? Math.round((clase.totalReservations / clase.spots) * 100)
          : 0,
      "Es Versus": clase.isVersus ? "Sí" : "No",
      "Número Versus": clase.versusNumber || "",
      "Texto Especial": clase.specialText || "",
      "Tipo Penalización": clase.penaltyType || "",
      "Puntos Penalización": clase.penaltyPoints || 0,
    }));

    exportToExcel(exportData, "Clases", "Clases", {
      columnWidths: [
        12, 10, 20, 15, 12, 12, 15, 12, 8, 12, 12, 12, 10, 12, 10, 10, 12, 20,
        15, 15,
      ],
    });
  };

  const handleExportPDF = async () => {
    if (!canReadClass) {
      toast.error("No tienes permisos para exportar clases");
      return;
    }

    if (selectedPeriod === "all") {
      toast.error("Por favor selecciona un período específico para exportar");
      return;
    }

    toast.info("Obteniendo datos para exportar...");

    // Obtener TODOS los datos del período sin paginación
    const allClassesData = await utils.classes.getWithFilters.fetch({
      limit: 10000,
      offset: 0,
      search: searchText,
      disciplineId:
        selectedDiscipline !== "all" ? selectedDiscipline : undefined,
      instructorId:
        selectedInstructor !== "all" ? selectedInstructor : undefined,
      periodId: selectedPeriod,
      studio: selectedCountry !== "all" ? selectedCountry : undefined,
    });

    const allClasses = allClassesData?.classes || [];

    if (allClasses.length === 0) {
      toast.error("No hay datos para exportar");
      return;
    }

    const currentPeriod = periods.find(
      (p: { id: string; number: number; year: number }) =>
        p.id === selectedPeriod
    );
    const periodLabel = currentPeriod
      ? `P${currentPeriod.number} - ${currentPeriod.year}`
      : undefined;

    await exportToPDF(
      <ClassesListPDF
        classes={allClasses}
        totalCount={allClasses.length}
        filters={{
          period: periodLabel,
        }}
      />,
      "Listado_Clases"
    );
  };

  // Si no tiene permiso de lectura, no mostrar nada (el sidebar ya lo oculta)
  if (!canReadClass) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Acceso Denegado</h2>
          <p className="text-muted-foreground">
            No tienes permisos para ver clases.
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
          <h1 className="text-2xl font-bold text-foreground">Clases</h1>
          <p className="text-sm text-muted-foreground mt-0.5 mr-8">
            Administra las clases del sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canReadClass && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={selectedPeriod === "all"}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-1.5" />
                  Exportar
                  <ChevronDown className="h-4 w-4 ml-1.5" />
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
          {canCreateClass && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="edit">
                  <Plus className="h-4 w-4 mr-1.5" />
                  <span>Nueva Clase</span>
                  <ChevronDown className="h-4 w-4 ml-1.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCreateSimple}>
                  <Plus className="mr-2 h-4 w-4" />
                  Clase Simple
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCreateVersus}>
                  <Plus className="mr-2 h-4 w-4" />
                  Clase Versus
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
              placeholder="Buscar por instructor, disciplina, estudio..."
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
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3">
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
      <ScrollableTable<ClassFromAPI>
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

      {/* Dialog para crear clase versus */}
      <VersusDialog
        isOpen={isVersusDialogOpen}
        onClose={handleVersusDialogClose}
        onSubmit={handleVersusDialogSubmit}
        isLoading={createClass.isPending}
      />
    </div>
  );
}
