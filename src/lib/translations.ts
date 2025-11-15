/**
 * Translation library for payment calculation logs and categories
 */

export const translations = {
  categories: {
    INSTRUCTOR: "Instructor",
    JUNIOR_AMBASSADOR: "Embajador Junior",
    AMBASSADOR: "Embajador",
    SENIOR_AMBASSADOR: "Embajador Senior",
  },
  metrics: {
    ocupacion: "Ocupación",
    clases: "Clases",
    localesEnBogota: "Locales en Bogotá",
    dobleteos: "Dobleteos",
    horariosNoPrime: "Horarios No Prime",
    participacionEventos: "Participación en Eventos",
    cumpleLineamientos: "Cumple Lineamientos",
    totalClasses: "Total de Clases",
    averageOccupancy: "Ocupación Promedio",
    totalLocations: "Locales Totales",
    totalDoubleShifts: "Dobleteos",
    nonPrimeHours: "Horarios No Prime",
    eventParticipation: "Participación en Eventos",
    meetsGuidelines: "Cumple Lineamientos",
    // Mapeo de claves en inglés a español
    totalclasses: "Total de Clases",
    averageoccupancy: "Ocupación Promedio",
    totallocations: "Locales Totales",
    totaldoubleshifts: "Dobleteos",
    nonprimehours: "Horarios No Prime",
    eventparticipation: "Participación en Eventos",
    meetsguidelines: "Cumple Lineamientos",
  },
  categoryReasons: {
    manual: "Asignación manual por administrador",
    auto: "Cálculo automático basado en métricas de rendimiento",
    requirements: "Basado en cumplimiento de requisitos",
  },
  criteria: {
    meets: "✅ Cumple",
    doesNotMeet: "❌ No cumple",
    notRequired: "⚠️ No requerido",
  },
  classes: {
    discipline: "Disciplina",
    date: "Fecha",
    studio: "Estudio",
    hour: "Hora",
    spots: "Capacidad",
    reservations: "Reservas",
    occupancy: "Ocupación",
    category: "Categoría",
    calculation: "Cálculo",
    amount: "Monto",
  },
  summary: {
    totalInstructors: "Total de Instructores",
    success: "Exitosos",
    errors: "Errores",
    skipped: "Omitidos",
    deletedPayments: "Pagos Eliminados",
  },
  financial: {
    baseAmount: "Monto Base",
    bonuses: "Bonificaciones",
    penalties: "Penalizaciones",
    retention: "Retención",
    finalPayment: "Pago Final",
  },
};

/**
 * Get translated category name
 */
export function getCategoryTranslation(category: string): string {
  return (
    translations.categories[category as keyof typeof translations.categories] ||
    category
  );
}

/**
 * Get translated metric name
 */
export function getMetricTranslation(metric: string): string {
  return (
    translations.metrics[metric as keyof typeof translations.metrics] || metric
  );
}

/**
 * Translate metric value
 */
export function formatMetricValue(
  key: string,
  value: number | boolean | string
): string {
  if (typeof value === "boolean") {
    return value ? "Sí" : "No";
  }
  if (typeof value === "number") {
    // Check if it's a percentage (0-100)
    if (
      key.toLowerCase().includes("ocupacion") ||
      key.toLowerCase().includes("occupancy")
    ) {
      return `${value.toFixed(1)}%`;
    }
    // Check if it's a decimal
    if (value < 1 && value > 0) {
      return value.toFixed(2);
    }
    return value.toString();
  }
  return String(value);
}

/**
 * Get category requirement description
 */
export function getCategoryReason(
  _category: string,
  isManual: boolean,
  requirements: Array<{
    key: string;
    meets: boolean;
    value: number | boolean;
    required: number | boolean;
  }>
): string {
  if (isManual) {
    return translations.categoryReasons.manual;
  }

  const failedRequirements = requirements.filter((r) => !r.meets);
  if (failedRequirements.length === 0) {
    return "Cumple todos los requisitos para esta categoría";
  }

  const failed = failedRequirements
    .map((r) => {
      const metricName = getMetricTranslation(r.key);
      const current = formatMetricValue(r.key, r.value);
      const required = formatMetricValue(r.key, r.required);
      return `${metricName}: ${current} (requerido: ${required})`;
    })
    .join(", ");

  return `No cumple: ${failed}`;
}
