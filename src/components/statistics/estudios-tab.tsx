"use client";

import { ArrowUpDown, Building, Download, MapPin, Search } from "lucide-react";
import React, { useState, useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
// UI Components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useExcelExport } from "@/hooks/useExcelExport";
import type {
  ChartDataPoint,
  DisciplinaPorEstudio,
  EstudioConDisciplinas,
  EstudioStats,
  ExportDisciplinaData,
  ExportEstudioData,
  OccupationChartDataPoint,
  VenueStats,
} from "@/types/statistics";
import { DashboardChart } from "./dashboard-chart";

interface EstudiosTabProps {
  venueStats: VenueStats | undefined;
  isLoading: boolean;
  periodLabel: string;
}

const _COLORS = {
  primary: "hsl(var(--primary))",
  success: "hsl(142 70% 45%)",
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function EstudiosTab({
  venueStats,
  isLoading,
  periodLabel,
}: EstudiosTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "ascending" | "descending";
  } | null>(null);
  const { exportToExcel } = useExcelExport();

  // Use venue stats from store for basic data
  const estadisticasPorEstudio = useMemo((): EstudioStats[] => {
    if (!venueStats) return [];

    // Agrupar por estudio base (antes del " - ")
    const estudiosMap = new Map<
      string,
      {
        nombre: string;
        clases: number;
        reservas: number;
        ocupacion: number;
        ocupacionPonderada: number;
        pagoTotal: number;
        instructores: Set<string>;
        disciplinas: Set<string>;
        porcentajeTotal: number;
        promedioPorClase: number;
      }
    >();

    // Process mostUsed
    venueStats.mostUsed.forEach((venue) => {
      const estudioBase = venue.name.split(" - ")[0] || venue.name;

      if (!estudiosMap.has(estudioBase)) {
        estudiosMap.set(estudioBase, {
          nombre: estudioBase,
          clases: 0,
          reservas: 0,
          ocupacion: 0,
          ocupacionPonderada: 0,
          pagoTotal: 0,
          instructores: new Set<string>(),
          disciplinas: new Set<string>(),
          porcentajeTotal: 0,
          promedioPorClase: 0,
        });
      }

      const estudio = estudiosMap.get(estudioBase)!;
      estudio.clases += venue.count;
      estudio.reservas += venue.totalReservations;
      // Promedio ponderado de ocupación basado en número de clases
      estudio.ocupacionPonderada += venue.averageOccupation * venue.count;
      if (venue.instructors)
        estudio.instructores.add(venue.instructors.toString());
    });

    // Process earningsByVenue
    venueStats.earningsByVenue.forEach((venue) => {
      const estudioBase = venue.name.split(" - ")[0] || venue.name;

      if (!estudiosMap.has(estudioBase)) {
        estudiosMap.set(estudioBase, {
          nombre: estudioBase,
          clases: 0,
          reservas: 0,
          ocupacion: 0,
          ocupacionPonderada: 0,
          pagoTotal: 0,
          instructores: new Set<string>(),
          disciplinas: new Set<string>(),
          porcentajeTotal: 0,
          promedioPorClase: 0,
        });
      }

      const estudio = estudiosMap.get(estudioBase)!;
      estudio.pagoTotal += venue.earnings;
      if (venue.classes > 0 && estudio.clases === 0)
        estudio.clases = venue.classes;
      if (venue.reservations > 0 && estudio.reservas === 0)
        estudio.reservas = venue.reservations;
      if (venue.instructors)
        estudio.instructores.add(venue.instructors.toString());
    });

    // Process disciplinesByVenue
    venueStats.disciplinesByVenue.forEach((venue) => {
      const estudioBase = venue.name.split(" - ")[0] || venue.name;

      if (estudiosMap.has(estudioBase)) {
        const estudio = estudiosMap.get(estudioBase)!;
        venue.disciplines.forEach((d) => {
          estudio.disciplinas.add(d.disciplineId);
        });
      }
    });

    // Calculate derived values
    const totalClases = Array.from(estudiosMap.values()).reduce(
      (sum, estudio) => sum + estudio.clases,
      0
    );

    const processedEstudios = Array.from(estudiosMap.values()).map(
      (estudio) => {
        // Calcular ocupación promedio ponderada
        const ocupacion =
          estudio.clases > 0
            ? Math.round(estudio.ocupacionPonderada / estudio.clases)
            : 0;

        // Calcular promedio por clase
        const promedioPorClase =
          estudio.clases > 0 ? estudio.pagoTotal / estudio.clases : 0;

        // Calcular porcentaje del total
        const porcentajeTotal =
          totalClases > 0 ? (estudio.clases / totalClases) * 100 : 0;

        // Convertir Sets a números
        const instructores = estudio.instructores.size;
        const disciplinas = estudio.disciplinas.size;

        return {
          nombre: estudio.nombre,
          clases: estudio.clases,
          reservas: estudio.reservas,
          ocupacion,
          pagoTotal: estudio.pagoTotal,
          instructores,
          disciplinas,
          porcentajeTotal,
          promedioPorClase,
        } as EstudioStats;
      }
    );

    return processedEstudios
      .filter((estudio) => estudio.clases > 0)
      .sort((a, b) => b.clases - a.clases);
  }, [venueStats]);

  // Calcular estadísticas por disciplina para cada estudio
  const disciplinasPorEstudio = useMemo((): EstudioConDisciplinas[] => {
    if (!venueStats?.disciplinesByVenue || !venueStats?.earningsByVenue)
      return [];

    // Agrupar venues por estudio base (antes del " - ")
    const estudiosMap = new Map<
      string,
      {
        nombre: string;
        disciplinas: DisciplinaPorEstudio[];
      }
    >();

    venueStats.disciplinesByVenue.forEach((venue) => {
      // Extraer el nombre base del estudio (parte antes del primer " - ")
      const estudioBase = venue.name.split(" - ")[0] || venue.name;

      // Get revenue data for this specific venue (not estudio base)
      const venueIngresos = venueStats.earningsByVenue.find(
        (v) => v.name === venue.name
      );
      const venueOcupacion = venueStats.mostUsed.find(
        (v) => v.name === venue.name
      );

      // Si el estudio base no existe, crearlo
      if (!estudiosMap.has(estudioBase)) {
        estudiosMap.set(estudioBase, {
          nombre: estudioBase,
          disciplinas: [],
        });
      }

      const estudio = estudiosMap.get(estudioBase)!;

      // Agregar disciplinas de este venue al estudio base
      venue.disciplines.forEach((d) => {
        const totalClasesVenue = venue.disciplines.reduce(
          (total, disc) => total + disc.count,
          0
        );
        const porcentaje =
          totalClasesVenue > 0 ? (d.count / totalClasesVenue) * 100 : 0;

        // Calculate proportional values based on this specific venue's totals
        const ocupacion = venueOcupacion ? venueOcupacion.averageOccupation : 0;
        const pagoTotal = venueIngresos
          ? (venueIngresos.earnings * porcentaje) / 100
          : 0;
        const promedioPorClase = d.count > 0 ? pagoTotal / d.count : 0;

        // Buscar si esta disciplina ya existe en el estudio
        const existingDisciplina = estudio.disciplinas.find(
          (disc) => disc.disciplinaId === d.disciplineId
        );

        if (existingDisciplina) {
          // Si existe, sumar los valores y calcular promedio ponderado de ocupación
          const clasesPrevias = existingDisciplina.clases;
          const nuevasClases = d.count;
          const totalClasesCombinadas = clasesPrevias + nuevasClases;

          // Promedio ponderado de ocupación basado en número de clases
          existingDisciplina.ocupacion =
            totalClasesCombinadas > 0
              ? (existingDisciplina.ocupacion * clasesPrevias +
                  ocupacion * nuevasClases) /
                totalClasesCombinadas
              : 0;

          existingDisciplina.clases = totalClasesCombinadas;
          existingDisciplina.pagoTotal += pagoTotal;
          existingDisciplina.promedioPorClase =
            existingDisciplina.clases > 0
              ? existingDisciplina.pagoTotal / existingDisciplina.clases
              : 0;
        } else {
          // Si no existe, agregarla
          estudio.disciplinas.push({
            disciplinaId: d.disciplineId,
            nombre: d.name,
            color: d.color,
            clases: d.count,
            porcentaje,
            ocupacion,
            pagoTotal,
            instructores: 0,
            promedioPorClase,
          });
        }
      });
    });

    // Convertir el Map a array y ordenar por número de clases totales
    return Array.from(estudiosMap.values()).sort((a, b) => {
      const totalClasesA = a.disciplinas.reduce((sum, d) => sum + d.clases, 0);
      const totalClasesB = b.disciplinas.reduce((sum, d) => sum + d.clases, 0);
      return totalClasesB - totalClasesA;
    });
  }, [venueStats]);

  // Filtrar estudios basándose en el término de búsqueda
  const filteredEstadisticas = useMemo(() => {
    return estadisticasPorEstudio.filter((estudio) =>
      estudio.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [estadisticasPorEstudio, searchTerm]);

  // Ordenar estudios
  const sortedEstadisticas = useMemo(() => {
    if (!sortConfig) return filteredEstadisticas;

    return [...filteredEstadisticas].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof EstudioStats];
      const bValue = b[sortConfig.key as keyof EstudioStats];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "ascending"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      const aNum = Number(aValue) || 0;
      const bNum = Number(bValue) || 0;

      return sortConfig.direction === "ascending" ? aNum - bNum : bNum - aNum;
    });
  }, [filteredEstadisticas, sortConfig]);

  const handleSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const handleExport = () => {
    const exportData = sortedEstadisticas.map((estudio) => ({
      Estudio: estudio.nombre,
      Clases: estudio.clases,
      Reservas: estudio.reservas,
      "Ocupación (%)": estudio.ocupacion,
      "Pago Total": estudio.pagoTotal,
      Instructores: estudio.instructores,
      Disciplinas: estudio.disciplinas,
      "% del Total": estudio.porcentajeTotal.toFixed(1),
      "Promedio por Clase": estudio.promedioPorClase.toFixed(2),
    }));

    exportToExcel(exportData, `estudios-${periodLabel}`, "Estudios", {
      columnWidths: [30, 10, 10, 12, 15, 12, 12, 12, 15],
    });
  };

  const handleExportDisciplinas = () => {
    const exportData: Array<Record<string, unknown>> = [];

    disciplinasPorEstudio.forEach((estudio) => {
      // Add individual discipline rows
      estudio.disciplinas.forEach((disciplina) => {
        exportData.push({
          Estudio: estudio.nombre,
          Disciplina: disciplina.nombre,
          Clases: disciplina.clases,
          "Ocupación (%)": Math.round(disciplina.ocupacion || 0),
          "Promedio/Clase": disciplina.promedioPorClase,
          "Pago Total": disciplina.pagoTotal,
        });
      });

      // Add total row for this study
      const totalClases = estudio.disciplinas.reduce(
        (sum, disc) => sum + disc.clases,
        0
      );
      const totalOcupacion =
        estudio.disciplinas.reduce(
          (sum, disc) => sum + (disc.ocupacion || 0),
          0
        ) / estudio.disciplinas.length || 0;
      const totalPago = estudio.disciplinas.reduce(
        (sum, disc) => sum + (disc.pagoTotal || 0),
        0
      );
      const totalPromedio = totalClases > 0 ? totalPago / totalClases : 0;

      exportData.push({
        Estudio: `TOTAL ${estudio.nombre}`,
        Disciplina: "",
        Clases: totalClases,
        "Ocupación (%)": Math.round(totalOcupacion),
        "Promedio/Clase": totalPromedio,
        "Pago Total": totalPago,
      });

      // Add empty row as separator
      exportData.push({
        Estudio: "",
        Disciplina: "",
        Clases: "",
        "Ocupación (%)": "",
        "Promedio/Clase": "",
        "Pago Total": "",
      });
    });

    exportToExcel(
      exportData,
      `disciplinas-por-estudio-${periodLabel}`,
      "Disciplinas por Estudio",
      {
        columnWidths: [30, 20, 10, 12, 15, 15],
      }
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-muted rounded animate-pulse" />
        <div className="h-96 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  // Agrupar salones más usados por estudio base
  const localesMasUsadosData = useMemo((): ChartDataPoint[] => {
    if (!venueStats?.mostUsed) return [];

    const estudiosMap = new Map<string, { name: string; value: number }>();

    venueStats.mostUsed.forEach((local) => {
      const estudioBase = local.name.split(" - ")[0] || local.name;

      if (!estudiosMap.has(estudioBase)) {
        estudiosMap.set(estudioBase, {
          name: estudioBase,
          value: 0,
        });
      }

      const estudio = estudiosMap.get(estudioBase)!;
      estudio.value += local.count;
    });

    return Array.from(estudiosMap.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [venueStats]);

  // Agrupar ocupación por estudio base con promedio ponderado
  const ocupacionPorSalonData = useMemo((): OccupationChartDataPoint[] => {
    if (!venueStats?.occupationByVenue) return [];

    const estudiosMap = new Map<
      string,
      {
        name: string;
        ocupacion: number;
        clases: number;
        ocupacionPonderada: number;
      }
    >();

    venueStats.occupationByVenue.forEach((salon) => {
      const estudioBase = salon.name.split(" - ")[0] || salon.name;

      if (!estudiosMap.has(estudioBase)) {
        estudiosMap.set(estudioBase, {
          name: estudioBase,
          ocupacion: 0,
          clases: 0,
          ocupacionPonderada: 0,
        });
      }

      const estudio = estudiosMap.get(estudioBase)!;
      estudio.clases += salon.classes;
      estudio.ocupacionPonderada += salon.occupation * salon.classes;
    });

    // Calcular ocupación promedio ponderada
    const result = Array.from(estudiosMap.values()).map((estudio) => ({
      name: estudio.name,
      ocupacion:
        estudio.clases > 0
          ? Math.round(estudio.ocupacionPonderada / estudio.clases)
          : 0,
      clases: estudio.clases,
    }));

    return result.sort((a, b) => b.ocupacion - a.ocupacion).slice(0, 10);
  }, [venueStats]);

  return (
    <div className="space-y-8">
      {/* Venue Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Estudios Más Utilizados */}
        <Card className="shadow-sm border-border hover:shadow-md transition-shadow">
          <CardHeader className="pb-2.5 p-3.5 border-b border-border/50">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="text-primary/70">
                <Building className="h-4 w-4" />
              </div>
              <span>Estudios Más Utilizados</span>
            </CardTitle>
            {periodLabel && (
              <CardDescription className="text-xs mt-0.5">
                {periodLabel}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="p-3.5 pt-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : localesMasUsadosData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No hay datos de estudios registrados en este periodo
              </div>
            ) : (
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={localesMasUsadosData}
                    layout="vertical"
                    margin={{ left: 10, right: 20 }}
                  >
                    <defs>
                      <linearGradient
                        id="barGradientSalones"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                      >
                        <stop
                          offset="0%"
                          stopColor="hsl(var(--primary))"
                          stopOpacity={0.9}
                        />
                        <stop
                          offset="100%"
                          stopColor="hsl(var(--primary))"
                          stopOpacity={0.6}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      horizontal={true}
                      vertical={false}
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      opacity={0.3}
                    />
                    <XAxis
                      type="number"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      style={{ fontSize: "11px" }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      width={120}
                      style={{ fontSize: "10px" }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip
                      cursor={false}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="rounded-lg border border-border bg-background p-2 shadow-md">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex items-center gap-1">
                                <div
                                  className="h-2 w-2 rounded-full"
                                  style={{
                                    backgroundColor: "hsl(var(--primary))",
                                  }}
                                />
                                <span className="text-xs font-medium">
                                  {payload[0]?.payload.name}:
                                </span>
                              </div>
                              <div className="text-xs font-medium">
                                {(payload[0]?.value as number) || 0} clases
                              </div>
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Bar
                      dataKey="value"
                      name="Clases"
                      fill="url(#barGradientSalones)"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ocupación por Estudio */}
        <Card className="shadow-sm border-border hover:shadow-md transition-shadow">
          <CardHeader className="pb-2.5 p-3.5 border-b border-border/50">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="text-primary/70">
                <MapPin className="h-4 w-4" />
              </div>
              <span>Ocupación por Estudio</span>
            </CardTitle>
            {periodLabel && (
              <CardDescription className="text-xs mt-0.5">
                {periodLabel}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="p-3.5 pt-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : ocupacionPorSalonData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No hay datos de ocupación por estudio para este periodo
              </div>
            ) : (
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={ocupacionPorSalonData}
                    layout="vertical"
                    margin={{ left: 10, right: 20 }}
                  >
                    <defs>
                      <linearGradient
                        id="barGradientOcupacion"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                      >
                        <stop
                          offset="0%"
                          stopColor="hsl(142 70% 45%)"
                          stopOpacity={0.9}
                        />
                        <stop
                          offset="100%"
                          stopColor="hsl(142 70% 45%)"
                          stopOpacity={0.6}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      horizontal={true}
                      vertical={false}
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      opacity={0.3}
                    />
                    <XAxis
                      type="number"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                      style={{ fontSize: "11px" }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      width={120}
                      style={{ fontSize: "10px" }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip
                      cursor={false}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="rounded-lg border border-border bg-background p-2 shadow-md">
                            <div className="text-xs font-medium mb-1">
                              {payload[0]?.payload.name}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex items-center gap-1">
                                <div
                                  className="h-2 w-2 rounded-full"
                                  style={{
                                    backgroundColor: "hsl(142 70% 45%)",
                                  }}
                                />
                                <span className="text-xs">Ocupación:</span>
                              </div>
                              <div className="text-xs font-medium">
                                {(payload[0]?.payload.ocupacion as number) || 0}
                                %
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex items-center gap-1">
                                <div
                                  className="h-2 w-2 rounded-full"
                                  style={{
                                    backgroundColor: "hsl(var(--primary))",
                                  }}
                                />
                                <span className="text-xs">Clases:</span>
                              </div>
                              <div className="text-xs font-medium">
                                {(payload[0]?.payload.clases as number) || 0}
                              </div>
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Bar
                      dataKey="ocupacion"
                      name="Porcentaje ocupación"
                      fill="url(#barGradientOcupacion)"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Primera tabla: Tabla General */}
      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-xl font-bold">
            Estadísticas Generales por Estudio
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Header con búsqueda y exportación */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar estudio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={handleExport}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar Excel
            </Button>
          </div>

          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("nombre")}
                      className="h-auto p-0 font-semibold"
                    >
                      Estudio
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("clases")}
                      className="h-auto p-0 font-semibold"
                    >
                      Clases
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("reservas")}
                      className="h-auto p-0 font-semibold"
                    >
                      Reservas
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("ocupacion")}
                      className="h-auto p-0 font-semibold"
                    >
                      Ocupación
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("pagoTotal")}
                      className="h-auto p-0 font-semibold"
                    >
                      Ingresos
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("instructores")}
                      className="h-auto p-0 font-semibold"
                    >
                      Instructores
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("disciplinas")}
                      className="h-auto p-0 font-semibold"
                    >
                      Disciplinas
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("porcentajeTotal")}
                      className="h-auto p-0 font-semibold"
                    >
                      % Total
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("promedioPorClase")}
                      className="h-auto p-0 font-semibold"
                    >
                      Promedio/Clase
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedEstadisticas.map((estudio) => (
                  <TableRow key={estudio.nombre} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {estudio.nombre}
                    </TableCell>
                    <TableCell className="text-center">
                      {estudio.clases}
                    </TableCell>
                    <TableCell className="text-center">
                      {estudio.reservas}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${
                          estudio.ocupacion >= 80
                            ? "bg-emerald-600/15 text-emerald-600 border-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-400 dark:border-emerald-400"
                            : estudio.ocupacion >= 60
                              ? "bg-amber-600/15 text-amber-600 border-amber-600 dark:bg-amber-400/15 dark:text-amber-400 dark:border-amber-400"
                              : "bg-red-600/15 text-red-600 border-red-600 dark:bg-red-400/15 dark:text-red-400 dark:border-red-400"
                        }`}
                      >
                        {estudio.ocupacion}%
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {formatCurrency(estudio.pagoTotal)}
                    </TableCell>
                    <TableCell className="text-center">
                      {estudio.instructores}
                    </TableCell>
                    <TableCell className="text-center">
                      {estudio.disciplinas}
                    </TableCell>
                    <TableCell className="text-center">
                      {estudio.porcentajeTotal.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-center">
                      {formatCurrency(estudio.promedioPorClase)}
                    </TableCell>
                  </TableRow>
                ))}
                {sortedEstadisticas.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {searchTerm
                        ? "No se encontraron estudios que coincidan con la búsqueda"
                        : "No hay datos disponibles"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Segunda tabla: Total de Clases por Estudio y Disciplina */}
      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold">
              Total de Clases por Estudio y Disciplina
            </CardTitle>
            <Button
              onClick={handleExportDisciplinas}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Estudio</TableHead>
                  <TableHead>Disciplina</TableHead>
                  <TableHead className="text-center">Clases</TableHead>
                  <TableHead className="text-center">Ocupación</TableHead>
                  <TableHead className="text-center">Promedio/Clase</TableHead>
                  <TableHead className="text-center">Pago Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disciplinasPorEstudio.map((estudio) => {
                  // Calcular totales para este estudio
                  const totalClases = estudio.disciplinas.reduce(
                    (sum, disc) => sum + disc.clases,
                    0
                  );
                  const totalOcupacion =
                    estudio.disciplinas.reduce(
                      (sum, disc) => sum + (disc.ocupacion || 0),
                      0
                    ) / estudio.disciplinas.length || 0;
                  const totalPago = estudio.disciplinas.reduce(
                    (sum, disc) => sum + (disc.pagoTotal || 0),
                    0
                  );
                  const totalPromedio =
                    totalClases > 0 ? totalPago / totalClases : 0;

                  return (
                    <React.Fragment key={estudio.nombre}>
                      {/* Filas de disciplinas individuales */}
                      {estudio.disciplinas.map((disciplina, index) => (
                        <TableRow
                          key={`${estudio.nombre}-${disciplina.disciplinaId}`}
                          className="hover:bg-muted/50"
                        >
                          <TableCell className="font-medium">
                            {index === 0 ? estudio.nombre : ""}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: disciplina.color }}
                              />
                              <span>{disciplina.nombre}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {disciplina.clases}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-sm font-medium">
                              {Math.round(disciplina.ocupacion || 0)}%
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            {formatCurrency(disciplina.promedioPorClase || 0)}
                          </TableCell>
                          <TableCell className="text-center">
                            {formatCurrency(disciplina.pagoTotal || 0)}
                          </TableCell>
                        </TableRow>
                      ))}
                      {/* Fila de total para este estudio */}
                      <TableRow className="bg-muted/30 font-semibold">
                        <TableCell className="font-bold">
                          TOTAL {estudio.nombre}
                        </TableCell>
                        <TableCell />
                        <TableCell className="text-center font-bold">
                          {totalClases}
                        </TableCell>
                        <TableCell className="text-center font-bold">
                          {Math.round(totalOcupacion)}%
                        </TableCell>
                        <TableCell className="text-center font-bold">
                          {formatCurrency(totalPromedio)}
                        </TableCell>
                        <TableCell className="text-center font-bold">
                          {formatCurrency(totalPago)}
                        </TableCell>
                      </TableRow>
                      {/* Separador visual */}
                      <TableRow>
                        <TableCell colSpan={6} className="h-px bg-border p-0" />
                      </TableRow>
                    </React.Fragment>
                  );
                })}
                {disciplinasPorEstudio.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No hay datos disponibles
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
