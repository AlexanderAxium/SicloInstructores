"use client";

import type {
  ClassStats,
  GeneralStats,
  InstructorStats,
  VenueStats,
} from "@/types/statistics";
import {
  BarChart3,
  BookOpen,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DashboardChart } from "./dashboard-chart";
import { StatCard } from "./stat-card";

interface GeneralTabProps {
  generalStats: GeneralStats | undefined;
  instructorStats: InstructorStats | undefined;
  classStats: ClassStats | undefined;
  venueStats: VenueStats | undefined;
  isLoading: boolean;
  periodLabel: string;
}

const COLORS = {
  primary: "hsl(var(--primary))",
  secondary: "hsl(220 70% 50%)",
  accent: "hsl(280 70% 50%)",
  success: "hsl(142 70% 45%)",
  muted: "hsl(var(--muted-foreground))",
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function GeneralTab({
  generalStats,
  instructorStats,
  classStats,
  isLoading,
  periodLabel,
}: GeneralTabProps) {
  // Prepare chart data
  const disciplinasData =
    classStats?.byDiscipline.slice(0, 5).map((d) => ({
      name: d.name,
      value: d.count,
      color: d.color,
    })) || [];

  const clasesPorDiaData =
    classStats?.byDay
      .map((d) => ({
        name: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][d.day] || "",
        value: d.count,
      }))
      .sort(
        (a, b) =>
          ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].indexOf(a.name) -
          ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].indexOf(b.name)
      ) || [];

  const clasesPorHoraData = classStats?.bySchedule || [];
  const reservasPorHoraData = classStats?.reservationsBySchedule || [];

  const instructoresTopData =
    instructorStats?.topByEarnings.slice(0, 10).map((instructor) => ({
      name: instructor.name,
      earnings: instructor.earnings,
      occupation: instructor.occupation,
    })) || [];

  const instructoresTopClasesData =
    instructorStats?.topByClasses.slice(0, 10).map((instructor) => ({
      name: instructor.name,
      classes: instructor.classes,
      reservations: instructor.reservations,
    })) || [];

  return (
    <>
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Instructores */}
        <StatCard
          title="Instructores"
          icon={<Users className="h-4 w-4" />}
          value={generalStats?.instructors.total || 0}
          subtitle="Activos"
          subtitleValue={`${generalStats?.instructors.active || 0} (${generalStats?.instructors.total ? Math.round((generalStats.instructors.active / generalStats.instructors.total) * 100) : 0}%)`}
          badge={`${generalStats?.instructors.new || 0} nuevos`}
          color="purple"
          footer={
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Con disciplinas</span>
              <span className="font-medium">
                {generalStats?.instructors.withDisciplines || 0}
              </span>
            </div>
          }
        />

        {/* Disciplinas */}
        <StatCard
          title="Disciplinas"
          icon={<BookOpen className="h-4 w-4" />}
          value={generalStats?.disciplines.total || 0}
          subtitle="Más popular"
          subtitleValue={
            disciplinasData.length > 0
              ? disciplinasData[0]?.name || "N/A"
              : "N/A"
          }
          badge={`${generalStats?.disciplines.active || 0} activas`}
          color="indigo"
          footer={
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Clases por disciplina
              </span>
              <span className="font-medium">
                {generalStats?.disciplines.total && generalStats?.classes.total
                  ? Math.round(
                      generalStats.classes.total /
                        generalStats.disciplines.total
                    )
                  : 0}
              </span>
            </div>
          }
        />

        {/* Clases */}
        <StatCard
          title="Clases"
          icon={<Calendar className="h-4 w-4" />}
          value={generalStats?.classes.total || 0}
          subtitle="Ocupación"
          subtitleValue={`${generalStats?.classes.averageOccupation || 0}%`}
          badge={`${generalStats?.classes.fullClasses || 0} llenas`}
          color="blue"
          footer={
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Reservas totales</span>
              <span className="font-medium">
                {generalStats?.classes.totalReservations || 0}
              </span>
            </div>
          }
        />

        {/* Pagos */}
        <StatCard
          title="Pagos"
          icon={<DollarSign className="h-4 w-4" />}
          value={formatCurrency(generalStats?.payments.totalAmount || 0)}
          subtitle="Pendiente"
          subtitleValue={formatCurrency(
            generalStats?.payments.pendingAmount || 0
          )}
          badge={`${Math.round(generalStats?.payments.percentagePaid || 0)}% completado`}
          color="emerald"
          footer={
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Promedio por pago</span>
              <span className="font-medium">
                {formatCurrency(generalStats?.payments.averageAmount || 0)}
              </span>
            </div>
          }
        />
      </div>

      {/* First Row of Charts */}
      <div className="grid gap-4 md:grid-cols-2 mt-4">
        {/* Disciplinas Populares */}
        <DashboardChart
          title="Disciplinas Más Impartidas"
          icon={<BarChart3 className="h-4 w-4" />}
          description={periodLabel}
          isLoading={isLoading}
          isEmpty={disciplinasData.length === 0}
          emptyMessage="No hay clases registradas en este periodo"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={disciplinasData}>
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.3}
              />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                style={{ fontSize: "11px" }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                style={{ fontSize: "11px" }}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip
                cursor={false}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-md">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-1">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{
                              backgroundColor:
                                payload[0]?.payload?.color || COLORS.primary,
                            }}
                          />
                          <span className="text-xs font-medium">
                            {payload[0]?.name}:
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
                radius={[4, 4, 0, 0]}
                fillOpacity={0.9}
              >
                {disciplinasData.map((entry, index: number) => (
                  <Cell
                    key={`cell-${entry.name || index}`}
                    fill={entry.color || COLORS.primary}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </DashboardChart>

        {/* Clases por Día */}
        <DashboardChart
          title="Clases por Día"
          icon={<TrendingUp className="h-4 w-4" />}
          description={periodLabel}
          isLoading={isLoading}
          isEmpty={clasesPorDiaData.length === 0}
          emptyMessage="No hay clases registradas en este periodo"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={clasesPorDiaData}>
              <defs>
                <linearGradient id="fillAreaDias" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(142 70% 45%)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(142 70% 45%)"
                    stopOpacity={0.05}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.3}
              />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                style={{ fontSize: "11px" }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                style={{ fontSize: "11px" }}
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
                            style={{ backgroundColor: "hsl(142 70% 45%)" }}
                          />
                          <span className="text-xs font-medium">
                            {payload[0]?.name}:
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
              <Area
                type="monotone"
                dataKey="value"
                name="Clases"
                stroke="hsl(142 70% 45%)"
                fill="url(#fillAreaDias)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </DashboardChart>
      </div>

      {/* Second Row of Charts */}
      <div className="grid gap-4 md:grid-cols-2 mt-4">
        {/* Clases por Horario */}
        <DashboardChart
          title="Clases por Horario"
          icon={<Clock className="h-4 w-4" />}
          description={periodLabel}
          isLoading={isLoading}
          isEmpty={clasesPorHoraData.length === 0}
          emptyMessage="No hay clases registradas en este periodo"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={clasesPorHoraData}>
              <defs>
                <linearGradient id="fillAreaHoras" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(220 70% 50%)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(220 70% 50%)"
                    stopOpacity={0.05}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.3}
              />
              <XAxis
                dataKey="hour"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.substring(0, 2)}
                style={{ fontSize: "11px" }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                style={{ fontSize: "11px" }}
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
                            style={{ backgroundColor: "hsl(220 70% 50%)" }}
                          />
                          <span className="text-xs font-medium">
                            Hora {payload[0]?.payload.hour}:
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
              <Area
                type="monotone"
                dataKey="count"
                name="Clases"
                stroke="hsl(220 70% 50%)"
                fill="url(#fillAreaHoras)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </DashboardChart>

        {/* Reservas por Horario */}
        <DashboardChart
          title="Reservas por Horario"
          icon={<TrendingUp className="h-4 w-4" />}
          description={periodLabel}
          isLoading={isLoading}
          isEmpty={reservasPorHoraData.length === 0}
          emptyMessage="No hay clases registradas en este periodo"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={reservasPorHoraData}>
              <defs>
                <linearGradient
                  id="fillAreaReservas"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="hsl(190 70% 50%)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(190 70% 50%)"
                    stopOpacity={0.05}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.3}
              />
              <XAxis
                dataKey="hour"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.substring(0, 2)}
                style={{ fontSize: "11px" }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                style={{ fontSize: "11px" }}
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
                            style={{ backgroundColor: "hsl(190 70% 50%)" }}
                          />
                          <span className="text-xs font-medium">
                            Hora {payload[0]?.payload.hour}:
                          </span>
                        </div>
                        <div className="text-xs font-medium">
                          {(payload[0]?.value as number) || 0} reservas
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="reservations"
                name="Reservas"
                stroke="hsl(190 70% 50%)"
                fill="url(#fillAreaReservas)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </DashboardChart>
      </div>

      {/* Third Row of Charts */}
      <div className="grid gap-4 md:grid-cols-2 mt-4">
        {/* Top Instructores por Ingresos */}
        <DashboardChart
          title="Top Instructores por Ingresos"
          icon={<BarChart3 className="h-4 w-4" />}
          description={periodLabel}
          isEmpty={instructoresTopData.length === 0}
          emptyMessage="No hay datos de ingresos para instructores en este periodo"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={instructoresTopData}>
              <defs>
                <linearGradient
                  id="barGradientIngresos"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="hsl(160 70% 45%)"
                    stopOpacity={0.9}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(160 70% 45%)"
                    stopOpacity={0.6}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.3}
              />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                angle={-45}
                textAnchor="end"
                height={70}
                style={{ fontSize: "10px" }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                style={{ fontSize: "11px" }}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip
                cursor={false}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="rounded-lg border border-border bg-background p-2 shadow-md">
                      <div className="text-xs font-medium mb-1">
                        {payload[0]?.payload?.name}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-1">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: "hsl(160 70% 45%)" }}
                          />
                          <span className="text-xs">Ingresos:</span>
                        </div>
                        <div className="text-xs font-medium">
                          {formatCurrency(
                            (payload[0]?.payload?.earnings as number) || 0
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-1">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: "hsl(190 70% 50%)" }}
                          />
                          <span className="text-xs">Ocupación:</span>
                        </div>
                        <div className="text-xs font-medium">
                          {(payload[0]?.payload?.occupation as number) || 0}%
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="earnings"
                name="Ingresos"
                fill="url(#barGradientIngresos)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </DashboardChart>

        {/* Top Instructores por Clases */}
        <DashboardChart
          title="Top Instructores por Clases"
          icon={<BookOpen className="h-4 w-4" />}
          description={periodLabel}
          isEmpty={instructoresTopClasesData.length === 0}
          emptyMessage="No hay datos de clases para instructores en este periodo"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={instructoresTopClasesData}>
              <defs>
                <linearGradient
                  id="barGradientClases"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="hsl(220 70% 50%)"
                    stopOpacity={0.9}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(220 70% 50%)"
                    stopOpacity={0.6}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.3}
              />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                angle={-45}
                textAnchor="end"
                height={70}
                style={{ fontSize: "10px" }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                style={{ fontSize: "11px" }}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip
                cursor={false}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="rounded-lg border border-border bg-background p-2 shadow-md">
                      <div className="text-xs font-medium mb-1">
                        {payload[0]?.payload?.name}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-1">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: "hsl(220 70% 50%)" }}
                          />
                          <span className="text-xs">Clases:</span>
                        </div>
                        <div className="text-xs font-medium">
                          {(payload[0]?.payload?.classes as number) || 0}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-1">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: "hsl(142 70% 45%)" }}
                          />
                          <span className="text-xs">Reservas:</span>
                        </div>
                        <div className="text-xs font-medium">
                          {(payload[0]?.payload?.reservations as number) || 0}
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="classes"
                name="Clases"
                fill="url(#barGradientClases)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </DashboardChart>
      </div>
    </>
  );
}
