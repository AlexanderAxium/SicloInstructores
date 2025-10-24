"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ScrollableTable,
  type TableColumn,
} from "@/components/ui/scrollable-table";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRBAC } from "@/hooks/useRBAC";
import { trpc } from "@/utils/trpc";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  Calendar,
  Edit,
  Info,
  Palette,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function DisciplineDetailPage() {
  const params = useParams();
  const { canManageUsers } = useRBAC();
  const disciplineId = params.id as string;

  // Estado para paginación
  const [instructorsPage, setInstructorsPage] = useState(1);
  const [classesPage, setClassesPage] = useState(1);
  const pageSize = 10;

  // Obtener datos de la disciplina usando tRPC
  const {
    data: discipline,
    isLoading,
    error,
  } = trpc.disciplines.getById.useQuery({ id: disciplineId });

  // Obtener estadísticas de la disciplina
  const { data: stats, isLoading: statsLoading } =
    trpc.disciplines.getStats.useQuery({ disciplineId });

  // Obtener instructores con paginación usando el router de instructor
  const { data: instructorsData, isLoading: instructorsLoading } =
    trpc.instructor.getWithFilters.useQuery({
      limit: pageSize,
      offset: (instructorsPage - 1) * pageSize,
      discipline: disciplineId,
    });

  // Obtener clases con paginación usando el router de clases
  const { data: classesData, isLoading: classesLoading } =
    trpc.classes.getWithFilters.useQuery({
      limit: pageSize,
      offset: (classesPage - 1) * pageSize,
      disciplineId: disciplineId,
    });

  const handleEdit = () => {
    // Implementar lógica de edición
    console.log("Editar disciplina:", discipline?.id);
  };

  // Definir columnas para la tabla de instructores
  const instructorsColumns: TableColumn[] = [
    {
      key: "name",
      title: "Instructor",
      render: (value, record) => (
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <span className="text-sm font-medium text-blue-600">
              {(value as string)?.charAt(0)?.toUpperCase() || "I"}
            </span>
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">
              {value as string}
            </div>
            <div className="text-xs text-muted-foreground">
              {(record as { fullName?: string; phone?: string }).fullName ||
                (record as { fullName?: string; phone?: string }).phone ||
                "Sin información adicional"}
            </div>
          </div>
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
      render: (value) => (
        <span className="text-xs text-muted-foreground">
          {new Date(value as string).toLocaleDateString()}
        </span>
      ),
    },
  ];

  // Definir columnas para la tabla de clases
  const classesColumns: TableColumn[] = [
    {
      key: "date",
      title: "Fecha",
      render: (value) => (
        <div className="text-sm font-medium">
          {new Date(value as string).toLocaleDateString("es-ES")}
        </div>
      ),
    },
    {
      key: "studio",
      title: "Estudio",
      render: (value) => (
        <span className="text-sm text-foreground">{value as string}</span>
      ),
    },
    {
      key: "room",
      title: "Sala",
      render: (value) => (
        <span className="text-sm text-foreground">{value as string}</span>
      ),
    },
    {
      key: "reservations",
      title: "Reservas",
      render: (_value, record) => {
        const recordData = record as {
          paidReservations: number;
          spots: number;
        };
        return (
          <div className="text-sm">
            <span className="font-medium">{recordData.paidReservations}</span>
            <span className="text-muted-foreground">/{recordData.spots}</span>
          </div>
        );
      },
    },
    {
      key: "occupation",
      title: "Ocupación",
      render: (_value, record) => {
        const recordData = record as {
          paidReservations: number;
          spots: number;
        };
        const percentage = Math.round(
          (recordData.paidReservations / recordData.spots) * 100
        );
        return (
          <div className="flex items-center gap-2">
            <div className="w-12 bg-muted rounded-full h-1.5">
              <div
                className="bg-primary h-1.5 rounded-full transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{percentage}%</span>
          </div>
        );
      },
    },
  ];

  // Preparar datos para las tablas con paginación
  const instructorsList = instructorsData?.instructors || [];
  const classesList = classesData?.classes || [];
  const totalInstructors = instructorsData?.total || 0;
  const totalClasses = classesData?.total || 0;

  const instructorsPagination = {
    page: instructorsPage,
    limit: pageSize,
    total: totalInstructors,
    totalPages: Math.ceil(totalInstructors / pageSize),
    hasNext: instructorsPage < Math.ceil(totalInstructors / pageSize),
    hasPrev: instructorsPage > 1,
  };

  const classesPagination = {
    page: classesPage,
    limit: pageSize,
    total: totalClasses,
    totalPages: Math.ceil(totalClasses / pageSize),
    hasNext: classesPage < Math.ceil(totalClasses / pageSize),
    hasPrev: classesPage > 1,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/disciplinas">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (error || !discipline) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/disciplinas">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
        </div>
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Disciplina no encontrada</h3>
          <p className="text-muted-foreground">
            La disciplina que buscas no existe o no tienes permisos para verla.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/disciplinas">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: discipline.color || "#6b7280" }}
              />
              <h1 className="text-2xl font-bold text-foreground">
                {discipline.name}
              </h1>
              <Badge
                variant={discipline.active ? "default" : "secondary"}
                className="text-xs"
              >
                {discipline.active ? "Activa" : "Inactiva"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {discipline.description || "Sin descripción"}
            </p>
          </div>
        </div>
        {canManageUsers && (
          <Button onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Instructores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : stats?.stats.totalInstructors || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              instructores asignados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clases</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : stats?.stats.totalClasses || 0}
            </div>
            <p className="text-xs text-muted-foreground">clases programadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ocupación Promedio
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading
                ? "..."
                : `${Math.round((stats?.stats.avgOccupation || 0) * 100)}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              en las últimas clases
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs con diseño mejorado */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-9 bg-muted/30 rounded-md p-0.5">
          <TabsTrigger
            value="info"
            className="flex items-center gap-1.5 text-xs font-medium px-2 py-1.5 rounded-sm transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/50"
          >
            <Info className="h-3.5 w-3.5" />
            Info
          </TabsTrigger>
          <TabsTrigger
            value="instructors"
            className="flex items-center gap-1.5 text-xs font-medium px-2 py-1.5 rounded-sm transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/50"
          >
            <Users className="h-3.5 w-3.5" />
            Instructores
          </TabsTrigger>
          <TabsTrigger
            value="classes"
            className="flex items-center gap-1.5 text-xs font-medium px-2 py-1.5 rounded-sm transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/50"
          >
            <Calendar className="h-3.5 w-3.5" />
            Clases
          </TabsTrigger>
          <TabsTrigger
            value="stats"
            className="flex items-center gap-1.5 text-xs font-medium px-2 py-1.5 rounded-sm transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/50"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Stats
          </TabsTrigger>
        </TabsList>

        {/* Tab de Información */}
        <TabsContent value="info" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="h-4 w-4" />
                  Información General
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Nombre</span>
                  <span className="font-medium">{discipline.name}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Estado</span>
                  <Badge
                    variant={discipline.active ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {discipline.active ? "Activa" : "Inactiva"}
                  </Badge>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Fecha de Creación
                  </span>
                  <span className="text-sm">
                    {new Date(discipline.createdAt).toLocaleDateString(
                      "es-ES",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Palette className="h-4 w-4" />
                  Configuración
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm text-muted-foreground">
                    Descripción
                  </span>
                  <p className="text-sm mt-1">
                    {discipline.description || "Sin descripción"}
                  </p>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Color</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded border-border"
                      style={{ backgroundColor: discipline.color || "#6b7280" }}
                    />
                    <span className="text-xs font-mono">
                      {discipline.color || "#6b7280"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab de Instructores */}
        <TabsContent value="instructors" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-4 w-4" />
                Instructores Asignados
                <Badge variant="secondary" className="ml-2">
                  {totalInstructors}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ScrollableTable
                data={instructorsList}
                columns={instructorsColumns}
                pagination={instructorsPagination}
                onPageChange={setInstructorsPage}
                loading={instructorsLoading}
                emptyMessage="No hay instructores asignados"
                emptyIcon={
                  <Users className="h-8 w-8 text-muted-foreground mx-auto" />
                }
                className="border-0"
                tableClassName="border-0"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Clases */}
        <TabsContent value="classes" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-4 w-4" />
                Clases Recientes
                <Badge variant="secondary" className="ml-2">
                  {totalClasses}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ScrollableTable
                data={classesList}
                columns={classesColumns}
                pagination={classesPagination}
                onPageChange={setClassesPage}
                loading={classesLoading}
                emptyMessage="No hay clases programadas"
                emptyIcon={
                  <Calendar className="h-8 w-8 text-muted-foreground mx-auto" />
                }
                className="border-0"
                tableClassName="border-0"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Estadísticas */}
        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-4 w-4" />
                  Instructores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? "..." : stats?.stats.totalInstructors || 0}
                </div>
                <p className="text-xs text-muted-foreground">asignados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-4 w-4" />
                  Clases
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? "..." : stats?.stats.totalClasses || 0}
                </div>
                <p className="text-xs text-muted-foreground">programadas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="h-4 w-4" />
                  Ocupación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading
                    ? "..."
                    : `${Math.round((stats?.stats.avgOccupation || 0) * 100)}%`}
                </div>
                <p className="text-xs text-muted-foreground">promedio</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-4 w-4" />
                Rendimiento Detallado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Ocupación Promedio</span>
                  <span>
                    {statsLoading
                      ? "..."
                      : `${Math.round((stats?.stats.avgOccupation || 0) * 100)}%`}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.round((stats?.stats.avgOccupation || 0) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                Basado en las últimas {stats?.stats.recentClassesCount || 0}{" "}
                clases
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
