"use client";

import { EstudiosTab } from "@/components/statistics/estudios-tab";
import { GeneralTab } from "@/components/statistics/general-tab";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePeriodFilter } from "@/hooks/usePeriodFilter";
import { trpc } from "@/utils/trpc";
import { Calendar } from "lucide-react";
import { useState } from "react";

export default function EstadisticasPage() {
  const [activeTab, setActiveTab] = useState("general");
  const { selectedPeriod, setSelectedPeriod } = usePeriodFilter();

  // Obtener períodos
  const { data: periodsData } = trpc.periods.getAll.useQuery();
  const periods = periodsData?.periods || [];

  // Preparar el filtro de período para las queries
  const periodFilter =
    selectedPeriod !== "all" ? { periodId: selectedPeriod } : {};

  // Obtener todas las estadísticas
  const { data: generalStats, isLoading: isLoadingGeneral } =
    trpc.statistics.getGeneral.useQuery(periodFilter, {
      enabled: selectedPeriod !== "all",
    });

  const { data: instructorStats, isLoading: isLoadingInstructor } =
    trpc.statistics.getInstructors.useQuery(periodFilter, {
      enabled: selectedPeriod !== "all",
    });

  const { data: classStats, isLoading: isLoadingClass } =
    trpc.statistics.getClasses.useQuery(periodFilter, {
      enabled: selectedPeriod !== "all",
    });

  const { data: venueStats, isLoading: isLoadingVenue } =
    trpc.statistics.getVenues.useQuery(periodFilter, {
      enabled: selectedPeriod !== "all",
    });

  const isLoading =
    isLoadingGeneral || isLoadingInstructor || isLoadingClass || isLoadingVenue;

  // Get period label
  const getPeriodLabel = () => {
    if (selectedPeriod === "all") {
      return "Todos los períodos";
    }

    const period = (
      periods as Array<{
        id: string;
        number: number;
        year: number;
        startDate: string;
        endDate: string;
      }>
    ).find((p) => p.id === selectedPeriod);
    return period
      ? `Período ${period.number} - ${period.year}`
      : "Período seleccionado";
  };

  const periodLabel = getPeriodLabel();

  // Get period date range
  const getPeriodDateRange = () => {
    if (selectedPeriod === "all") {
      return "";
    }

    const period = (
      periods as Array<{
        id: string;
        number: number;
        year: number;
        startDate: string;
        endDate: string;
      }>
    ).find((p) => p.id === selectedPeriod);
    if (!period) return "";

    const startDate = new Date(period.startDate).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const endDate = new Date(period.endDate).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    return `${startDate} - ${endDate}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Estadísticas Generales
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {periodLabel}
            {getPeriodDateRange() && ` • ${getPeriodDateRange()}`}
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Period selector */}
          <div className="w-full md:w-[250px]">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Seleccionar período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los períodos</SelectItem>
                {periods?.map(
                  (period: { id: string; number: number; year: number }) => (
                    <SelectItem key={period.id} value={period.id}>
                      Período {period.number} - {period.year}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* No period selected message */}
      {selectedPeriod === "all" && (
        <div className="rounded-lg border border-border bg-muted/50 p-8 text-center">
          <div className="flex flex-col items-center gap-2">
            <Calendar className="h-12 w-12 text-muted-foreground" />
            <h3 className="font-semibold text-lg">Selecciona un período</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Para ver las estadísticas, por favor selecciona un período
              específico en el selector de arriba.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      {selectedPeriod !== "all" && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full md:w-[280px] grid-cols-2 h-8 p-0.5 bg-muted/50 border border-border">
            <TabsTrigger
              value="general"
              className="text-xs h-7 px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              General
            </TabsTrigger>
            <TabsTrigger
              value="estudios"
              className="text-xs h-7 px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Estudios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6 space-y-6">
            <GeneralTab
              generalStats={generalStats}
              instructorStats={instructorStats}
              classStats={classStats}
              venueStats={venueStats}
              isLoading={isLoading}
              periodLabel={periodLabel}
            />
          </TabsContent>

          <TabsContent value="estudios" className="mt-6">
            <EstudiosTab
              venueStats={venueStats}
              isLoading={isLoadingVenue}
              periodLabel={periodLabel}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
