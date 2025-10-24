import {
  BarChart3,
  Calendar,
  DollarSign,
  FileText,
  Settings,
  Users,
} from "lucide-react";
import React from "react";

const features = [
  {
    icon: Users,
    title: "Gestión de Instructores",
    description:
      "Administra instructores, sus disciplinas, categorías y información de contacto de forma centralizada.",
  },
  {
    icon: Calendar,
    title: "Programación de Clases",
    description:
      "Crea y gestiona horarios de clases, reservas, listas de espera y estadísticas de ocupación.",
  },
  {
    icon: DollarSign,
    title: "Cálculo de Pagos",
    description:
      "Sistema automático de cálculo de pagos con bonificaciones, penalizaciones y ajustes personalizados.",
  },
  {
    icon: BarChart3,
    title: "Reportes y Estadísticas",
    description:
      "Genera reportes detallados de rendimiento, ocupación y métricas financieras en tiempo real.",
  },
  {
    icon: FileText,
    title: "Gestión de Documentos",
    description:
      "Administra covers, penalizaciones, brandings, theme rides y workshops de manera organizada.",
  },
  {
    icon: Settings,
    title: "Configuración Flexible",
    description:
      "Personaliza fórmulas de pago, períodos, disciplinas y parámetros del sistema según tus necesidades.",
  },
];

export function SimpleFeatures() {
  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Funcionalidades Principales
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Todo lo que necesitas para gestionar tu centro de fitness de manera
            profesional y eficiente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card rounded-lg p-6 hover:shadow-lg transition-shadow border border-border"
            >
              <div className="flex items-center mb-4">
                <div className="bg-primary/10 p-3 rounded-lg mr-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground">
                  {feature.title}
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
