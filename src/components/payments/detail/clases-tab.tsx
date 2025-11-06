"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { isNonPrimeHour } from "@/lib/config";
import { formatDateInLima, formatTime } from "@/lib/date-utils";
import type { Class, Discipline } from "@/types";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Info,
  X,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";

interface ClassesTabProps {
  instructorClasses: Class[];
  disciplines: Discipline[];
  payment?: {
    details?: {
      classCalculations?: Array<{
        classId: string;
        calculatedAmount: number;
        disciplineId: string;
        disciplineName: string;
        classDate: Date | string;
        calculationDetail: string;
        category: string;
        isVersus: boolean;
        versusNumber?: number | null;
        isFullHouse: boolean;
        studio: string;
        hour: string;
        spots: number;
        totalReservations: number;
        occupancy: number;
      }>;
    } | null;
  } | null;
}

interface FilterState {
  search: string;
  semanas: number[];
  estudios: string[];
  disciplinas: string[];
  horario: "todos" | "prime" | "noPrime";
  ocupacionMin: number;
  ocupacionMax: number;
  conCortesias: boolean;
  horaInicio: string;
  horaFin: string;
}

type SortField =
  | "fecha"
  | "horario"
  | "estudio"
  | "disciplina"
  | "reservas"
  | "cortesias"
  | "monto"
  | null;
type SortDirection = "asc" | "desc";

const ITEMS_PER_PAGE = 15;

const HORAS_DISPONIBLES = [
  "00:00",
  "01:00",
  "02:00",
  "03:00",
  "04:00",
  "05:00",
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
  "23:00",
];

export function ClassesTab({
  instructorClasses,
  disciplines,
  payment,
}: ClassesTabProps) {
  // Helper function to format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 2,
    }).format(amount);
  };
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    semanas: [],
    estudios: [],
    disciplinas: [],
    horario: "todos",
    ocupacionMin: 0,
    ocupacionMax: 120,
    conCortesias: false,
    horaInicio: "00:00",
    horaFin: "23:59",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const esClaseHorarioNoPrime = useCallback((clase: Class): boolean => {
    const hora = formatTime(clase.date, 5);
    return isNonPrimeHour(clase.studio || "", hora);
  }, []);

  const estaEnRangoHorario = useCallback(
    (hora: string, inicio: string, fin: string): boolean => {
      const convertirAMinutos = (h: string) => {
        const parts = h.split(":").map(Number);
        const horas = parts[0] ?? 0;
        const minutos = parts[1] ?? 0;
        return horas * 60 + minutos;
      };

      const minHora = convertirAMinutos(hora);
      const minInicio = convertirAMinutos(inicio);
      const minFin = convertirAMinutos(fin);

      if (minFin < minInicio) {
        return minHora >= minInicio || minHora <= minFin;
      }

      return minHora >= minInicio && minHora <= minFin;
    },
    []
  );

  const uniqueStudios = useMemo(() => {
    const estudios = new Set<string>();
    instructorClasses.forEach((clase) => {
      if (clase.studio) estudios.add(clase.studio);
    });
    return Array.from(estudios).sort();
  }, [instructorClasses]);

  const uniqueWeeks = useMemo(() => {
    const semanas = new Set<number>();
    instructorClasses.forEach((clase) => {
      if (clase.week) semanas.add(clase.week);
    });
    return Array.from(semanas).sort((a, b) => a - b);
  }, [instructorClasses]);

  const filteredClasses = useMemo(() => {
    return instructorClasses.filter((clase) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const estudioMatch = (clase.studio || "")
          .toLowerCase()
          .includes(searchLower);
        const salonMatch = (clase.room || "")
          .toLowerCase()
          .includes(searchLower);
        const disciplinaMatch = disciplines
          .find((d) => d.id === clase.disciplineId)
          ?.name.toLowerCase()
          .includes(searchLower);

        if (!estudioMatch && !salonMatch && !disciplinaMatch) {
          return false;
        }
      }

      if (filters.semanas.length > 0 && !filters.semanas.includes(clase.week)) {
        return false;
      }

      if (
        filters.estudios.length > 0 &&
        !filters.estudios.includes(clase.studio || "")
      ) {
        return false;
      }

      if (
        filters.disciplinas.length > 0 &&
        !filters.disciplinas.includes(clase.disciplineId)
      ) {
        return false;
      }

      if (filters.horario === "prime" && esClaseHorarioNoPrime(clase)) {
        return false;
      }
      if (filters.horario === "noPrime" && !esClaseHorarioNoPrime(clase)) {
        return false;
      }

      const horaClase = formatTime(clase.date, 5);
      if (!estaEnRangoHorario(horaClase, filters.horaInicio, filters.horaFin)) {
        return false;
      }

      const ocupacionPorcentaje = Math.round(
        (clase.totalReservations / clase.spots) * 100
      );
      if (
        ocupacionPorcentaje < filters.ocupacionMin ||
        ocupacionPorcentaje > filters.ocupacionMax
      ) {
        return false;
      }

      if (filters.conCortesias && (clase.complimentary || 0) <= 0) {
        return false;
      }

      return true;
    });
  }, [
    instructorClasses,
    filters,
    disciplines,
    esClaseHorarioNoPrime,
    estaEnRangoHorario,
  ]);

  const sortedClasses = useMemo(() => {
    const clases = [...filteredClasses];

    if (!sortField) {
      return clases.sort((a, b) => {
        const fechaA = new Date(a.date);
        const fechaB = new Date(b.date);
        return fechaA.getTime() - fechaB.getTime();
      });
    }

    return clases.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "fecha": {
          const fechaA = new Date(a.date);
          const fechaB = new Date(b.date);
          comparison = fechaA.getTime() - fechaB.getTime();
          break;
        }
        case "horario": {
          const horaA = formatTime(a.date, 5);
          const horaB = formatTime(b.date, 5);
          comparison = horaA.localeCompare(horaB);
          break;
        }
        case "estudio": {
          const estudioA = a.studio || "";
          const estudioB = b.studio || "";
          comparison = estudioA.localeCompare(estudioB);
          break;
        }
        case "disciplina": {
          const disciplinaA =
            disciplines.find((d) => d.id === a.disciplineId)?.name || "";
          const disciplinaB =
            disciplines.find((d) => d.id === b.disciplineId)?.name || "";
          comparison = disciplinaA.localeCompare(disciplinaB);
          break;
        }
        case "reservas": {
          const ocupacionA = Math.round((a.totalReservations / a.spots) * 100);
          const ocupacionB = Math.round((b.totalReservations / b.spots) * 100);
          comparison = ocupacionA - ocupacionB;
          break;
        }
        case "cortesias":
          comparison = (a.complimentary || 0) - (b.complimentary || 0);
          break;
        case "monto": {
          const classCalculationA = payment?.details?.classCalculations?.find(
            (c) => c.classId === a.id
          );
          const classCalculationB = payment?.details?.classCalculations?.find(
            (c) => c.classId === b.id
          );
          const montoA = classCalculationA?.calculatedAmount || 0;
          const montoB = classCalculationB?.calculatedAmount || 0;
          comparison = montoA - montoB;
          break;
        }
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [
    filteredClasses,
    sortField,
    sortDirection,
    disciplines,
    payment?.details?.classCalculations,
  ]);

  const limpiarFiltros = () => {
    setFilters({
      search: "",
      semanas: [],
      estudios: [],
      disciplinas: [],
      horario: "todos",
      ocupacionMin: 0,
      ocupacionMax: 120,
      conCortesias: false,
      horaInicio: "00:00",
      horaFin: "23:59",
    });
    setCurrentPage(1);
  };

  const contarFiltrosActivos = (): number => {
    let count = 0;
    if (filters.search) count++;
    if (filters.semanas.length > 0) count++;
    if (filters.estudios.length > 0) count++;
    if (filters.disciplinas.length > 0) count++;
    if (filters.horario !== "todos") count++;
    if (filters.ocupacionMin > 0 || filters.ocupacionMax < 120) count++;
    if (filters.conCortesias) count++;
    if (filters.horaInicio !== "00:00" || filters.horaFin !== "23:59") count++;
    return count;
  };

  const filtrosActivos = contarFiltrosActivos();
  const totalPages = Math.ceil(sortedClasses.length / ITEMS_PER_PAGE);
  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages || 1));

  const classesOnCurrentPage = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
    return sortedClasses.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedClasses, validCurrentPage]);

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;

    return sortDirection === "asc" ? (
      <ArrowUp className="ml-1 h-3 w-3 inline" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3 inline" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Barra de búsqueda y filtros */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
        <div className="relative w-full md:w-64">
          <Input
            placeholder="Buscar por estudio, salón..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-9 text-sm md:text-base"
          />
          <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>

        <div className="flex gap-2 flex-wrap">
          {/* Desktop Filter Button */}
          <Popover>
            <PopoverTrigger asChild className="hidden md:flex">
              <Button variant="outline" className="gap-1.5">
                <Filter className="h-4 w-4" />
                Filtros
                {filtrosActivos > 0 && (
                  <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                    {filtrosActivos}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[600px] p-0" align="start">
              <div className="border-b border-border p-4 bg-muted/30">
                <h4 className="font-medium leading-none">Filtros avanzados</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Configura los filtros para encontrar clases específicas
                </p>
              </div>

              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Primera columna */}
                  <div className="space-y-4">
                    {/* Filtro por semana */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Semanas</Label>
                      <ScrollArea className="h-30 rounded-md border border-border">
                        <div className="p-2 space-y-1">
                          {uniqueWeeks.map((semana) => (
                            <div
                              key={semana}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`semana-${semana}`}
                                checked={filters.semanas.includes(semana)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setFilters({
                                      ...filters,
                                      semanas: [...filters.semanas, semana],
                                    });
                                  } else {
                                    setFilters({
                                      ...filters,
                                      semanas: filters.semanas.filter(
                                        (s) => s !== semana
                                      ),
                                    });
                                  }
                                  setCurrentPage(1);
                                }}
                              />
                              <Label
                                htmlFor={`semana-${semana}`}
                                className="text-sm cursor-pointer"
                              >
                                Semana {semana}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>

                    {/* Filtro por estudio */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Estudios</Label>
                      <ScrollArea className="h-30 rounded-md border border-border">
                        <div className="p-2 space-y-1">
                          {uniqueStudios.map((estudio) => (
                            <div
                              key={estudio}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`estudio-${estudio}`}
                                checked={filters.estudios.includes(estudio)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setFilters({
                                      ...filters,
                                      estudios: [...filters.estudios, estudio],
                                    });
                                  } else {
                                    setFilters({
                                      ...filters,
                                      estudios: filters.estudios.filter(
                                        (e) => e !== estudio
                                      ),
                                    });
                                  }
                                  setCurrentPage(1);
                                }}
                              />
                              <Label
                                htmlFor={`estudio-${estudio}`}
                                className="text-sm cursor-pointer"
                              >
                                {estudio}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>

                  {/* Segunda columna */}
                  <div className="space-y-4">
                    {/* Filtro por disciplina */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Disciplinas</Label>
                      <ScrollArea className="h-30 rounded-md border border-border">
                        <div className="p-2 space-y-1">
                          {disciplines.map((disciplina) => (
                            <div
                              key={disciplina.id}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`disciplina-${disciplina.id}`}
                                checked={filters.disciplinas.includes(
                                  disciplina.id
                                )}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setFilters({
                                      ...filters,
                                      disciplinas: [
                                        ...filters.disciplinas,
                                        disciplina.id,
                                      ],
                                    });
                                  } else {
                                    setFilters({
                                      ...filters,
                                      disciplinas: filters.disciplinas.filter(
                                        (id) => id !== disciplina.id
                                      ),
                                    });
                                  }
                                  setCurrentPage(1);
                                }}
                              />
                              <Label
                                htmlFor={`disciplina-${disciplina.id}`}
                                className="text-sm cursor-pointer flex items-center"
                              >
                                <span
                                  className="inline-block w-3 h-3 rounded-full mr-1.5"
                                  style={{
                                    backgroundColor: disciplina.color || "#888",
                                  }}
                                />
                                {disciplina.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>

                    {/* Filtro por horario */}
                    <div className="space-y-2">
                      <Label htmlFor="horario" className="text-sm font-medium">
                        Tipo de Horario
                      </Label>
                      <Select
                        value={filters.horario}
                        onValueChange={(
                          value: "todos" | "prime" | "noPrime"
                        ) => {
                          setFilters({ ...filters, horario: value });
                          setCurrentPage(1);
                        }}
                      >
                        <SelectTrigger id="horario">
                          <SelectValue placeholder="Seleccionar horario" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">
                            Todos los horarios
                          </SelectItem>
                          <SelectItem value="prime">Solo Prime</SelectItem>
                          <SelectItem value="noPrime">Solo No Prime</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Filtros adicionales */}
                <div className="border-t border-border pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Filtro por ocupación */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-sm font-medium">Ocupación</Label>
                        <span className="text-sm text-muted-foreground">
                          {filters.ocupacionMin}% - {filters.ocupacionMax}%
                        </span>
                      </div>
                      <Slider
                        defaultValue={[
                          filters.ocupacionMin,
                          filters.ocupacionMax,
                        ]}
                        min={0}
                        max={120}
                        step={5}
                        onValueChange={(values) => {
                          setFilters({
                            ...filters,
                            ocupacionMin: values[0] ?? 0,
                            ocupacionMax: values[1] ?? 120,
                          });
                          setCurrentPage(1);
                        }}
                        className="py-4"
                      />
                    </div>

                    {/* Filtro por rango de horario */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Rango de Horario
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label
                            htmlFor="horaInicio"
                            className="text-xs text-muted-foreground"
                          >
                            Desde
                          </Label>
                          <Select
                            value={filters.horaInicio}
                            onValueChange={(value) => {
                              setFilters({ ...filters, horaInicio: value });
                              setCurrentPage(1);
                            }}
                          >
                            <SelectTrigger id="horaInicio">
                              <SelectValue placeholder="Hora inicio" />
                            </SelectTrigger>
                            <SelectContent>
                              {HORAS_DISPONIBLES.map((hora) => (
                                <SelectItem key={`inicio-${hora}`} value={hora}>
                                  {hora}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label
                            htmlFor="horaFin"
                            className="text-xs text-muted-foreground"
                          >
                            Hasta
                          </Label>
                          <Select
                            value={filters.horaFin}
                            onValueChange={(value) => {
                              setFilters({ ...filters, horaFin: value });
                              setCurrentPage(1);
                            }}
                          >
                            <SelectTrigger id="horaFin">
                              <SelectValue placeholder="Hora fin" />
                            </SelectTrigger>
                            <SelectContent>
                              {HORAS_DISPONIBLES.map((hora) => (
                                <SelectItem key={`fin-${hora}`} value={hora}>
                                  {hora}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Checkbox para cortesías */}
                  <div className="mt-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="conCortesias"
                        checked={filters.conCortesias}
                        onCheckedChange={(checked) => {
                          setFilters({ ...filters, conCortesias: !!checked });
                          setCurrentPage(1);
                        }}
                      />
                      <Label
                        htmlFor="conCortesias"
                        className="text-sm cursor-pointer"
                      >
                        Con cortesías
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between p-4 border-t border-border bg-muted/30">
                <Button variant="outline" size="sm" onClick={limpiarFiltros}>
                  Limpiar filtros
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Indicadores de filtros activos */}
      {filtrosActivos > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium mr-2">Filtros activos:</span>

          {filters.search && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Búsqueda: {filters.search}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => {
                  setFilters({ ...filters, search: "" });
                  setCurrentPage(1);
                }}
              />
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={limpiarFiltros}
            className="h-7 px-2 text-xs"
          >
            Limpiar todos
          </Button>
        </div>
      )}

      {/* Class counter */}
      <div className="text-sm text-muted-foreground">
        Mostrando {classesOnCurrentPage.length} de {sortedClasses.length} clases
        {sortedClasses.length !== instructorClasses.length && (
          <span> (de un total de {instructorClasses.length})</span>
        )}
      </div>

      {sortedClasses.length === 0 ? (
        <div className="text-center py-8 bg-muted/10 rounded-lg border border-border">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium text-foreground">
            No hay clases que coincidan con los filtros
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Intenta ajustar los criterios de filtrado para ver resultados.
          </p>
          {filtrosActivos > 0 && (
            <Button variant="outline" className="mt-4" onClick={limpiarFiltros}>
              Limpiar todos los filtros
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-accent/5 border-b border-border/40">
                <TableRow>
                  <TableHead className="text-accent font-medium whitespace-nowrap w-[80px]">
                    ID
                  </TableHead>
                  <TableHead
                    className="text-accent font-medium whitespace-nowrap cursor-pointer w-[120px]"
                    onClick={() => toggleSort("fecha")}
                  >
                    Fecha {renderSortIndicator("fecha")}
                  </TableHead>
                  <TableHead
                    className="text-accent font-medium whitespace-nowrap cursor-pointer hidden md:table-cell w-[140px]"
                    onClick={() => toggleSort("horario")}
                  >
                    Horario {renderSortIndicator("horario")}
                  </TableHead>
                  <TableHead
                    className="text-accent font-medium whitespace-nowrap cursor-pointer hidden md:table-cell w-[160px]"
                    onClick={() => toggleSort("estudio")}
                  >
                    Estudio {renderSortIndicator("estudio")}
                  </TableHead>
                  <TableHead
                    className="text-accent font-medium whitespace-nowrap cursor-pointer w-[150px]"
                    onClick={() => toggleSort("disciplina")}
                  >
                    Disciplina {renderSortIndicator("disciplina")}
                  </TableHead>
                  <TableHead
                    className="text-accent font-medium whitespace-nowrap cursor-pointer w-[100px]"
                    onClick={() => toggleSort("reservas")}
                  >
                    Reservas {renderSortIndicator("reservas")}
                  </TableHead>
                  <TableHead className="text-accent font-medium whitespace-nowrap hidden md:table-cell w-[100px]">
                    Lugares
                  </TableHead>
                  <TableHead
                    className="text-accent font-medium whitespace-nowrap cursor-pointer w-[120px]"
                    onClick={() => toggleSort("monto")}
                  >
                    Monto {renderSortIndicator("monto")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classesOnCurrentPage.map((clase: Class) => {
                  const disciplina = disciplines.find(
                    (d) => d.id === clase.disciplineId
                  );
                  const reservasCompletas =
                    clase.totalReservations >= clase.spots;
                  const esNoPrime = esClaseHorarioNoPrime(clase);
                  const hora = formatTime(clase.date, 5);

                  return (
                    <TableRow
                      key={clase.id}
                      className="hover:bg-muted/5 transition-colors border-b border-border/30"
                    >
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {clase.id}
                      </TableCell>
                      <TableCell className="font-medium whitespace-nowrap text-foreground">
                        <div>
                          {formatDateInLima(clase.date)}
                          <div className="text-xs text-muted-foreground mt-1 md:hidden">
                            {hora} • {clase.studio}
                            {esNoPrime && (
                              <Badge
                                variant="outline"
                                className="text-xs font-medium ml-1"
                                style={{
                                  borderColor: "#f59e0b",
                                  color: "#f59e0b",
                                  backgroundColor: "#f59e0b1a",
                                }}
                              >
                                NP
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{hora}</span>
                          {esNoPrime && (
                            <Badge
                              variant="outline"
                              className="text-xs font-medium ml-1"
                              style={{
                                borderColor: "#f59e0b",
                                color: "#f59e0b",
                                backgroundColor: "#f59e0b1a",
                              }}
                            >
                              No Prime
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-col">
                          <span className="text-foreground">
                            {clase.studio}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {clase.room}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="text-xs font-medium"
                            style={{
                              borderColor: disciplina?.color || "#6b7280",
                              color: disciplina?.color || "#6b7280",
                              backgroundColor: `${disciplina?.color || "#6b7280"}1a`,
                            }}
                          >
                            {disciplina?.name ||
                              `Disciplina ${clase.disciplineId}`}
                          </Badge>
                          {clase.isVersus &&
                            clase.versusNumber &&
                            clase.versusNumber > 1 && (
                              <Badge
                                variant="outline"
                                className="text-xs font-medium"
                                style={{
                                  borderColor: "#a855f7",
                                  color: "#a855f7",
                                  backgroundColor: "#a855f71a",
                                }}
                              >
                                VS {clase.versusNumber}
                              </Badge>
                            )}
                        </div>
                      </TableCell>
                      <TableCell className="text-left">
                        <span
                          className={
                            reservasCompletas
                              ? "text-emerald-600 font-medium pl-4"
                              : "pl-4"
                          }
                        >
                          {clase.totalReservations}
                          <span className="text-muted-foreground text-xs ml-1 md:hidden">
                            / {clase.spots}
                          </span>
                        </span>
                      </TableCell>
                      <TableCell className="text-left pl-8 hidden md:table-cell">
                        {clase.spots}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {(() => {
                          const classCalculation =
                            payment?.details?.classCalculations?.find(
                              (c) => c.classId === clase.id
                            );

                          if (!classCalculation) {
                            return <span>-</span>;
                          }

                          return (
                            <TooltipProvider delayDuration={500}>
                              <Tooltip>
                                <TooltipTrigger className="flex items-center gap-1">
                                  <span>
                                    {formatCurrency(
                                      classCalculation.calculatedAmount
                                    )}
                                  </span>
                                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent className="w-80 max-w-sm bg-white border-border">
                                  <div className="space-y-2">
                                    <p className="font-semibold text-sm border-b border-border pb-2 text-gray-900">
                                      Detalle de cálculo de la clase
                                    </p>

                                    {/* Información básica de la clase */}
                                    <div className="bg-gray-50 p-2 rounded text-xs space-y-1 border border-border">
                                      <div className="flex items-center justify-between">
                                        <span className="text-gray-600">
                                          Estudio:
                                        </span>
                                        <span className="font-medium text-gray-900">
                                          {classCalculation.studio}
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-gray-600">
                                          Horario:
                                        </span>
                                        <span className="font-medium text-gray-900">
                                          {classCalculation.hour}
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-gray-600">
                                          Capacidad:
                                        </span>
                                        <span className="font-medium text-gray-900">
                                          {classCalculation.spots} lugares
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-gray-600">
                                          Reservas:
                                        </span>
                                        <span className="font-medium text-gray-900">
                                          {classCalculation.totalReservations}
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-gray-600">
                                          Ocupación:
                                        </span>
                                        <span className="font-medium text-gray-900">
                                          {classCalculation.occupancy}%
                                        </span>
                                      </div>
                                    </div>

                                    {/* Información de Versus */}
                                    {classCalculation.isVersus &&
                                      classCalculation.versusNumber &&
                                      classCalculation.versusNumber > 1 && (
                                        <div className="bg-purple-50 p-2 rounded text-xs border border-purple-200">
                                          <span className="font-medium text-purple-700">
                                            Clase Versus (
                                            {classCalculation.versusNumber}{" "}
                                            instructores)
                                          </span>
                                          <p className="text-purple-600 mt-1">
                                            Los valores mostrados ya están
                                            ajustados para el cálculo individual
                                          </p>
                                        </div>
                                      )}

                                    {/* Información de Full House */}
                                    {classCalculation.isFullHouse && (
                                      <div className="bg-green-50 p-2 rounded text-xs border border-green-200">
                                        <span className="font-medium text-green-700 flex items-center gap-1">
                                          <Check className="h-3 w-3 inline" />
                                          Clase FULL HOUSE
                                        </span>
                                        <p className="text-green-600 mt-1">
                                          Se considera al 100% de ocupación para
                                          el cálculo
                                        </p>
                                      </div>
                                    )}

                                    {/* Detalle del cálculo */}
                                    <div className="bg-blue-50 p-2 rounded text-xs border border-blue-200">
                                      <p className="font-medium text-blue-700 mb-1">
                                        Fórmula de cálculo:
                                      </p>
                                      <p className="text-blue-600 whitespace-pre-line">
                                        {classCalculation.calculationDetail}
                                      </p>
                                    </div>

                                    {/* Resumen final */}
                                    <div className="pt-2 border-t border-border">
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-600">
                                          Categoría:
                                        </span>
                                        <span className="font-medium text-gray-900">
                                          {classCalculation.category}
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between text-xs mt-1">
                                        <span className="text-gray-600">
                                          Monto calculado:
                                        </span>
                                        <span className="font-bold text-gray-900">
                                          {formatCurrency(
                                            classCalculation.calculatedAmount
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          );
                        })()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <div className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Mostrar números de página */}
                <div className="hidden md:flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = i + 1;

                    if (totalPages > 5) {
                      if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="h-8 w-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
