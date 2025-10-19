"use client";

import {
  BarChart3,
  BookOpen,
  Clock,
  DollarSign,
  Eye,
  FileText,
  Info,
  Settings,
  TrendingUp,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface ViewerDashboardProps {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
  } | null;
}

export default function ViewerDashboard({ user }: ViewerDashboardProps) {
  const router = useRouter();

  const viewerStats = {
    totalViews: 156,
    reportsViewed: 23,
    dataPoints: 1240,
    lastLogin: "Hace 2 horas",
  };

  const availableReports = [
    {
      id: 1,
      title: "Resumen de Mercados",
      description: "Análisis general de los mercados financieros",
      type: "market",
      lastUpdated: "Hace 1 hora",
      icon: <BarChart3 className="h-5 w-5 text-blue-600" />,
    },
    {
      id: 2,
      title: "Estadísticas de Usuarios",
      description: "Métricas de usuarios activos y registros",
      type: "users",
      lastUpdated: "Hace 3 horas",
      icon: <Users className="h-5 w-5 text-green-600" />,
    },
    {
      id: 3,
      title: "Rendimiento del Sistema",
      description: "Métricas de rendimiento y disponibilidad",
      type: "system",
      lastUpdated: "Hace 6 horas",
      icon: <TrendingUp className="h-5 w-5 text-purple-600" />,
    },
    {
      id: 4,
      title: "Actividad de la Plataforma",
      description: "Resumen de actividad de la plataforma",
      type: "platform",
      lastUpdated: "Hace 12 horas",
      icon: <DollarSign className="h-5 w-5 text-orange-600" />,
    },
  ];

  const viewerActions = [
    {
      title: "Ver Reportes",
      description: "Acceder a reportes disponibles",
      icon: <FileText className="h-6 w-6" />,
      color: "bg-blue-500",
      href: "/reports",
    },
    {
      title: "Dashboard Público",
      description: "Ver métricas públicas",
      icon: <BarChart3 className="h-6 w-6" />,
      color: "bg-green-500",
      href: "/public-dashboard",
    },
    {
      title: "Documentación",
      description: "Leer documentación del sistema",
      icon: <BookOpen className="h-6 w-6" />,
      color: "bg-purple-500",
      href: "/docs",
    },
    {
      title: "Configuración",
      description: "Ajustar preferencias",
      icon: <Settings className="h-6 w-6" />,
      color: "bg-gray-500",
      href: "/settings",
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: "report_viewed",
      message: "Viste el reporte 'Resumen de Mercados'",
      time: "Hace 30 minutos",
      icon: <FileText className="h-4 w-4 text-blue-600" />,
    },
    {
      id: 2,
      type: "data_exported",
      message: "Exportaste datos de usuarios",
      time: "Hace 2 horas",
      icon: <DollarSign className="h-4 w-4 text-green-600" />,
    },
    {
      id: 3,
      type: "dashboard_accessed",
      message: "Accediste al dashboard público",
      time: "Hace 4 horas",
      icon: <BarChart3 className="h-4 w-4 text-purple-600" />,
    },
    {
      id: 4,
      type: "settings_updated",
      message: "Actualizaste tus preferencias",
      time: "Ayer",
      icon: <Settings className="h-4 w-4 text-gray-600" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Viewer Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Dashboard de Visualización
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5 mr-8">
            Bienvenido, {user?.name || "Usuario"} - Acceso de solo lectura a
            reportes y métricas
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Eye className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-foreground">Viewer</span>
        </div>
      </div>

      {/* Viewer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">
                Total Vistas
              </p>
              <p className="text-2xl font-bold text-foreground">
                {viewerStats.totalViews}
              </p>
              <p className="text-xs text-blue-600">+12 esta semana</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">
                Reportes Vistos
              </p>
              <p className="text-2xl font-bold text-foreground">
                {viewerStats.reportsViewed}
              </p>
              <p className="text-xs text-green-600">Último: hace 1 hora</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">
                Puntos de Datos
              </p>
              <p className="text-2xl font-bold text-foreground">
                {viewerStats.dataPoints.toLocaleString()}
              </p>
              <p className="text-xs text-purple-600">
                Disponibles para análisis
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">
                Último Acceso
              </p>
              <p className="text-2xl font-bold text-foreground">
                {viewerStats.lastLogin}
              </p>
              <p className="text-xs text-orange-600">Sesión activa</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Viewer Actions */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Acciones Disponibles
            </h3>
            <div className="space-y-3">
              {viewerActions.map((action) => (
                <button
                  key={action.href}
                  type="button"
                  onClick={() => router.push(action.href)}
                  className="w-full flex items-center p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div
                    className={`p-2 ${action.color} rounded-lg text-white mr-3`}
                  >
                    {action.icon}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">
                      {action.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Available Reports */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Reportes Disponibles
            </h3>
            <div className="space-y-4">
              {availableReports.map((report) => (
                <button
                  key={report.id}
                  type="button"
                  className="w-full flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 cursor-pointer text-left"
                  onClick={() => router.push(`/reports/${report.id}`)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-muted rounded-lg">{report.icon}</div>
                    <div>
                      <p className="font-medium text-foreground">
                        {report.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {report.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Actualizado: {report.lastUpdated}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {report.type}
                    </span>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <button
                type="button"
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                Ver todos los reportes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Actividad Reciente
          </h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">{activity.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{activity.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <button
              type="button"
              className="text-sm text-primary hover:text-primary/80 font-medium"
            >
              Ver toda la actividad
            </button>
          </div>
        </div>
      </div>

      {/* Account Status */}
      <div>
        <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Info className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Estado de la Cuenta
                </h3>
                <p className="text-sm text-muted-foreground">
                  Cuenta de visualización activa - Acceso limitado a reportes
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Tipo de cuenta</p>
              <p className="text-sm font-medium text-foreground">Viewer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
