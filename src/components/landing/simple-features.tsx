import {
  BarChart3,
  Calendar,
  DollarSign,
  FileSpreadsheet,
  ListChecks,
  Settings,
  Users,
} from "lucide-react";
import React from "react";

const features = [
  {
    icon: Users,
    title: "Gestión de Instructores",
    description:
      "Administra instructores, sus disciplinas, categorías e información de contacto de forma centralizada. Controla el estado activo/inactivo de cada instructor.",
  },
  {
    icon: Calendar,
    title: "Registro de Clases",
    description:
      "Registra clases por semana, instructor y disciplina. Gestiona ocupación, covers, clases versus y seguimiento completo de cada sesión.",
  },
  {
    icon: FileSpreadsheet,
    title: "Importación Masiva",
    description:
      "Importa clases desde Excel con validación automática. El sistema detecta instructores, disciplinas y crea clases en masa de forma eficiente.",
  },
  {
    icon: DollarSign,
    title: "Cálculo Automático de Pagos",
    description:
      "Calcula pagos según ocupación, categoría del instructor y fórmulas personalizadas. Incluye bonos, penalizaciones y retención automática.",
  },
  {
    icon: ListChecks,
    title: "Bonos y Penalizaciones",
    description:
      "Administra covers, brandings, theme rides, workshops, clases versus y penalizaciones con sistema de puntos configurable.",
  },
  {
    icon: Settings,
    title: "Configuración Flexible",
    description:
      "Define períodos, disciplinas, fórmulas de pago y tarifas personalizadas. Ajusta parámetros del sistema según tus necesidades.",
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
              key={`feature-${feature.title}-${index}`}
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
