import { isNonPrimeHour } from "@/lib/config";
import { prisma } from "@/lib/db";
import type { Class } from "@/types/classes";

export type InstructorCategoryType =
  | "INSTRUCTOR"
  | "JUNIOR_AMBASSADOR"
  | "AMBASSADOR"
  | "SENIOR_AMBASSADOR";

export interface DisciplineMetrics {
  totalClasses: number;
  averageOccupancy: number;
  totalLocations: number;
  totalDoubleShifts: number;
  nonPrimeHours: number;
  eventParticipation: boolean;
  meetsGuidelines: boolean;
}

export interface CategoryRequirements {
  ocupacion: number;
  clases: number;
  localesEnLima: number;
  dobleteos: number;
  horariosNoPrime: number;
  participacionEventos: boolean;
  lineamientos: boolean;
}

/**
 * Calculate metrics for a specific discipline
 */
export async function calculateDisciplineMetrics(
  instructorId: string,
  disciplineId: string,
  periodId: string,
  tenantId: string
): Promise<DisciplineMetrics> {
  // Get all classes for this instructor, discipline, and period
  const classes = await prisma.class.findMany({
    where: {
      instructorId,
      disciplineId,
      periodId,
      tenantId,
    },
  });

  const totalClasses = classes.length;
  const totalReservations = classes.reduce(
    (sum, c) => sum + c.totalReservations,
    0
  );
  const totalSpots = classes.reduce((sum, c) => sum + c.spots, 0);
  const averageOccupancy =
    totalSpots > 0 ? (totalReservations / totalSpots) * 100 : 0;

  // Count unique locations (studios)
  const locations = new Set(classes.map((c) => c.studio).filter(Boolean));
  const totalLocations = locations.size;

  // Calculate double shifts (consecutive classes)
  const totalDoubleShifts = calculateDoubleShifts(classes);

  // Calculate non-prime hours
  const nonPrimeHours = await calculateNonPrimeHours(classes, disciplineId);

  // Get instructor info for event participation and guidelines
  const instructor = await prisma.instructor.findUnique({
    where: { id: instructorId },
    select: { extraInfo: true },
  });

  const extraInfo = instructor?.extraInfo as
    | { eventParticipation?: boolean; meetsGuidelines?: boolean }
    | undefined;

  return {
    totalClasses,
    averageOccupancy: Math.round(averageOccupancy),
    totalLocations,
    totalDoubleShifts,
    nonPrimeHours,
    eventParticipation: extraInfo?.eventParticipation ?? false,
    meetsGuidelines: extraInfo?.meetsGuidelines ?? true,
  };
}

/**
 * Calculate number of double shifts (consecutive classes)
 */
function calculateDoubleShifts(classes: Class[]): number {
  if (classes.length <= 1) return 0;

  // Group classes by date
  const classesByDate = new Map<string, Class[]>();
  classes.forEach((clase) => {
    const dateObj = new Date(clase.date);
    if (Number.isNaN(dateObj.getTime())) return;

    const dateKey = dateObj.toISOString().split("T")[0];
    if (!dateKey) return;

    if (!classesByDate.has(dateKey)) {
      classesByDate.set(dateKey, []);
    }
    const dayClasses = classesByDate.get(dateKey);
    if (dayClasses) {
      dayClasses.push(clase);
    }
  });

  let totalDoubleShifts = 0;

  // Check consecutive classes on each day
  for (const classesOfDay of classesByDate.values()) {
    // Sort by time
    classesOfDay.sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      return timeA - timeB;
    });

    // Check for consecutive classes (within 1 hour difference)
    for (let i = 0; i < classesOfDay.length - 1; i++) {
      const currentClass = classesOfDay[i];
      const nextClass = classesOfDay[i + 1];

      if (!currentClass || !nextClass) continue;

      const timeDiff =
        new Date(nextClass.date).getTime() -
        new Date(currentClass.date).getTime();
      const hourDiff = timeDiff / (1000 * 60 * 60);

      if (hourDiff >= 0 && hourDiff <= 1) {
        totalDoubleShifts++;
      }
    }
  }

  return totalDoubleShifts;
}

/**
 * Calculate number of classes in non-prime hours
 */
async function calculateNonPrimeHours(
  classes: Class[],
  disciplineId: string
): Promise<number> {
  // Get discipline to check if it's Síclo
  const discipline = await prisma.discipline.findUnique({
    where: { id: disciplineId },
    select: { name: true },
  });

  // Only calculate for Síclo
  if (discipline?.name !== "Síclo") return 0;

  let nonPrimeCount = 0;

  for (const clase of classes) {
    const dateObj = new Date(clase.date);
    const hours = dateObj.getHours().toString().padStart(2, "0");
    const minutes = dateObj.getMinutes().toString().padStart(2, "0");
    const timeStr = `${hours}:${minutes}`;

    // Use configuration function to check if it's non-prime
    if (isNonPrimeHour(clase.studio, timeStr)) {
      nonPrimeCount++;
    }
  }

  return nonPrimeCount;
}

/**
 * Determine instructor category based on formula requirements and metrics
 */
export function determineCategory(
  requirements: CategoryRequirements,
  metrics: DisciplineMetrics
): InstructorCategoryType {
  // Check SENIOR_AMBASSADOR (highest category)
  if (
    metrics.averageOccupancy >= requirements.ocupacion &&
    metrics.totalClasses / 4 >= requirements.clases &&
    metrics.totalLocations >= requirements.localesEnLima &&
    metrics.totalDoubleShifts >= requirements.dobleteos &&
    metrics.nonPrimeHours >= requirements.horariosNoPrime &&
    (metrics.eventParticipation || !requirements.participacionEventos) &&
    (metrics.meetsGuidelines || !requirements.lineamientos)
  ) {
    return "SENIOR_AMBASSADOR";
  }

  // If it's SENIOR_AMBASSADOR requirements, check AMBASSADOR next
  // Otherwise continue with normal flow
  if (requirements.ocupacion > 0) {
    // This means we're checking for AMBASSADOR
    // But check if it should be JUNIOR_AMBASSADOR
    const _juniorRequirements: Partial<CategoryRequirements> = {
      // Add junior requirements logic here if needed
    };

    // Check AMBASSADOR
    if (
      metrics.averageOccupancy >= requirements.ocupacion * 0.8 &&
      metrics.totalClasses / 4 >= requirements.clases * 0.8 &&
      metrics.totalLocations >= requirements.localesEnLima * 0.8 &&
      metrics.totalDoubleShifts >= requirements.dobleteos * 0.8 &&
      metrics.nonPrimeHours >= requirements.horariosNoPrime * 0.8 &&
      (metrics.eventParticipation || !requirements.participacionEventos) &&
      (metrics.meetsGuidelines || !requirements.lineamientos)
    ) {
      return "AMBASSADOR";
    }
  }

  // Check JUNIOR_AMBASSADOR
  // This would be a simplified check - in reality you'd need specific requirements
  if (
    metrics.averageOccupancy >= (requirements.ocupacion * 0.6 || 50) &&
    metrics.totalClasses / 4 >= (requirements.clases * 0.6 || 2)
  ) {
    return "JUNIOR_AMBASSADOR";
  }

  // Default to INSTRUCTOR
  return "INSTRUCTOR";
}

/**
 * Get or calculate instructor category for a specific discipline and period
 */
export async function getOrCalculateCategory(
  instructorId: string,
  disciplineId: string,
  periodId: string,
  tenantId: string,
  logs: string[] = []
): Promise<InstructorCategoryType> {
  // Check if there's an existing manual category
  const existingCategory = await prisma.instructorCategory.findFirst({
    where: {
      instructorId,
      disciplineId,
      periodId,
      tenantId,
      isManual: true,
    },
  });

  if (existingCategory) {
    logs.push(
      `📋 Usando categoría manual existente: ${existingCategory.category}`
    );
    return existingCategory.category as InstructorCategoryType;
  }

  // Get formula for this discipline and period
  const formula = await prisma.formula.findUnique({
    where: {
      disciplineId_periodId_tenantId: {
        disciplineId,
        periodId,
        tenantId,
      },
    },
  });

  if (!formula) {
    logs.push("⚠️ No se encontró fórmula, usando INSTRUCTOR por defecto");
    return "INSTRUCTOR";
  }

  // Parse category requirements
  const categoryReq = formula.categoryRequirements as unknown;
  const requirements = categoryReq as Record<string, CategoryRequirements>;

  // Calculate metrics
  const metrics = await calculateDisciplineMetrics(
    instructorId,
    disciplineId,
    periodId,
    tenantId
  );

  logs.push(`📊 Métricas calculadas: ${JSON.stringify(metrics)}`);

  // Determine category
  let category: InstructorCategoryType = "INSTRUCTOR";

  // Check each category level (from highest to lowest)
  // Start with the highest category and work down
  const categoryLevels: InstructorCategoryType[] = [
    "SENIOR_AMBASSADOR",
    "AMBASSADOR",
    "JUNIOR_AMBASSADOR",
    "INSTRUCTOR",
  ];

  // Check highest category first
  for (const cat of categoryLevels) {
    const catKey =
      cat === "SENIOR_AMBASSADOR"
        ? "EMBAJADOR_SENIOR"
        : cat === "AMBASSADOR"
          ? "EMBAJADOR"
          : cat === "JUNIOR_AMBASSADOR"
            ? "EMBAJADOR_JUNIOR"
            : "INSTRUCTOR";

    const catRequirements = requirements[catKey];
    if (!catRequirements) {
      logs.push(`⚠️ No se encontraron requisitos para ${catKey}`);
      continue;
    }

    const meetsRequirements =
      metrics.averageOccupancy >= catRequirements.ocupacion &&
      metrics.totalClasses >= catRequirements.clases &&
      metrics.totalLocations >= catRequirements.localesEnLima &&
      metrics.totalDoubleShifts >= catRequirements.dobleteos &&
      metrics.nonPrimeHours >= catRequirements.horariosNoPrime &&
      (!catRequirements.participacionEventos || metrics.eventParticipation) &&
      (!catRequirements.lineamientos || metrics.meetsGuidelines);

    logs.push(
      `📊 Evaluando ${cat}: cumple=${meetsRequirements} (ocupación: ${metrics.averageOccupancy}% vs ${catRequirements.ocupacion}%, clases: ${metrics.totalClasses} vs ${catRequirements.clases}, locations: ${metrics.totalLocations} vs ${catRequirements.localesEnLima}, eventos: ${metrics.eventParticipation} vs ${catRequirements.participacionEventos})`
    );

    if (meetsRequirements) {
      category = cat;
      logs.push(`✅ Categoría determinada: ${category}`);
      break;
    }
  }

  // Save the calculated category
  await prisma.instructorCategory.upsert({
    where: {
      instructorId_disciplineId_periodId_tenantId: {
        instructorId,
        disciplineId,
        periodId,
        tenantId,
      },
    },
    create: {
      instructorId,
      disciplineId,
      periodId,
      category,
      isManual: false,
      metrics: JSON.parse(JSON.stringify(metrics)),
      tenantId,
    },
    update: {
      category,
      metrics: JSON.parse(JSON.stringify(metrics)),
    },
  });

  return category;
}

/**
 * Evaluate all category criteria and return what criteria meets or not
 */
export function evaluateCategoryCriteria(
  requirements: Record<string, CategoryRequirements>,
  metrics: DisciplineMetrics,
  targetCategory: InstructorCategoryType
): {
  meets: Array<{
    key: string;
    label: string;
    current: number | boolean;
    required: number | boolean;
    meets: boolean;
  }>;
  failed: Array<{
    key: string;
    label: string;
    current: number | boolean;
    required: number | boolean;
    meets: boolean;
  }>;
} {
  const catKey =
    targetCategory === "SENIOR_AMBASSADOR"
      ? "EMBAJADOR_SENIOR"
      : targetCategory === "AMBASSADOR"
        ? "EMBAJADOR"
        : targetCategory === "JUNIOR_AMBASSADOR"
          ? "EMBAJADOR_JUNIOR"
          : "INSTRUCTOR";

  const catRequirements = requirements[catKey];
  if (!catRequirements) {
    return { meets: [], failed: [] };
  }

  const meets: Array<{
    key: string;
    label: string;
    current: number | boolean;
    required: number | boolean;
    meets: boolean;
  }> = [];
  const failed: Array<{
    key: string;
    label: string;
    current: number | boolean;
    required: number | boolean;
    meets: boolean;
  }> = [];

  // Evaluate each criterion
  if (metrics.averageOccupancy >= catRequirements.ocupacion) {
    meets.push({
      key: "ocupacion",
      label: "Ocupación",
      current: metrics.averageOccupancy,
      required: catRequirements.ocupacion,
      meets: true,
    });
  } else {
    failed.push({
      key: "ocupacion",
      label: "Ocupación",
      current: metrics.averageOccupancy,
      required: catRequirements.ocupacion,
      meets: false,
    });
  }

  const classesPerWeek = metrics.totalClasses / 4;
  if (classesPerWeek >= catRequirements.clases) {
    meets.push({
      key: "clases",
      label: "Clases por Semana",
      current: classesPerWeek,
      required: catRequirements.clases,
      meets: true,
    });
  } else {
    failed.push({
      key: "clases",
      label: "Clases por Semana",
      current: classesPerWeek,
      required: catRequirements.clases,
      meets: false,
    });
  }

  if (metrics.totalLocations >= catRequirements.localesEnLima) {
    meets.push({
      key: "localesEnLima",
      label: "Locales en Lima",
      current: metrics.totalLocations,
      required: catRequirements.localesEnLima,
      meets: true,
    });
  } else {
    failed.push({
      key: "localesEnLima",
      label: "Locales en Lima",
      current: metrics.totalLocations,
      required: catRequirements.localesEnLima,
      meets: false,
    });
  }

  if (metrics.totalDoubleShifts >= catRequirements.dobleteos) {
    meets.push({
      key: "dobleteos",
      label: "Dobleteos",
      current: metrics.totalDoubleShifts,
      required: catRequirements.dobleteos,
      meets: true,
    });
  } else {
    failed.push({
      key: "dobleteos",
      label: "Dobleteos",
      current: metrics.totalDoubleShifts,
      required: catRequirements.dobleteos,
      meets: false,
    });
  }

  if (metrics.nonPrimeHours >= catRequirements.horariosNoPrime) {
    meets.push({
      key: "horariosNoPrime",
      label: "Horarios No Prime",
      current: metrics.nonPrimeHours,
      required: catRequirements.horariosNoPrime,
      meets: true,
    });
  } else {
    failed.push({
      key: "horariosNoPrime",
      label: "Horarios No Prime",
      current: metrics.nonPrimeHours,
      required: catRequirements.horariosNoPrime,
      meets: false,
    });
  }

  if (!catRequirements.participacionEventos || metrics.eventParticipation) {
    meets.push({
      key: "participacionEventos",
      label: "Participación en Eventos",
      current: metrics.eventParticipation,
      required: catRequirements.participacionEventos,
      meets: true,
    });
  } else {
    failed.push({
      key: "participacionEventos",
      label: "Participación en Eventos",
      current: metrics.eventParticipation,
      required: catRequirements.participacionEventos,
      meets: false,
    });
  }

  if (!catRequirements.lineamientos || metrics.meetsGuidelines) {
    meets.push({
      key: "lineamientos",
      label: "Cumple Lineamientos",
      current: metrics.meetsGuidelines,
      required: catRequirements.lineamientos,
      meets: true,
    });
  } else {
    failed.push({
      key: "lineamientos",
      label: "Cumple Lineamientos",
      current: metrics.meetsGuidelines,
      required: catRequirements.lineamientos,
      meets: false,
    });
  }

  return { meets, failed };
}

/**
 * Evaluate ALL categories for a discipline to show which one was achieved
 */
export function evaluateAllCategories(
  requirements: Record<string, CategoryRequirements>,
  metrics: DisciplineMetrics
): Array<{
  category: InstructorCategoryType;
  categoryKey: string;
  categoryLabel: string;
  criteria: Array<{
    key: string;
    label: string;
    current: number | boolean;
    required: number | boolean;
    meets: boolean;
  }>;
  allMeets: boolean;
}> {
  const categories = [
    { type: "INSTRUCTOR" as const, key: "INSTRUCTOR", label: "Instructor" },
    {
      type: "JUNIOR_AMBASSADOR" as const,
      key: "EMBAJADOR_JUNIOR",
      label: "Embajador Junior",
    },
    { type: "AMBASSADOR" as const, key: "EMBAJADOR", label: "Embajador" },
    {
      type: "SENIOR_AMBASSADOR" as const,
      key: "EMBAJADOR_SENIOR",
      label: "Embajador Senior",
    },
  ];

  return categories.map((cat) => {
    const catRequirements = requirements[cat.key];
    if (!catRequirements) {
      return {
        category: cat.type,
        categoryKey: cat.key,
        categoryLabel: cat.label,
        criteria: [],
        allMeets: false,
      };
    }

    const classesPerWeek = metrics.totalClasses / 4;
    const requiredClassesPerWeek = catRequirements.clases;

    const criteria = [
      {
        key: "ocupacion",
        label: "Ocupación",
        current: metrics.averageOccupancy,
        required: catRequirements.ocupacion,
        meets: metrics.averageOccupancy >= catRequirements.ocupacion,
      },
      {
        key: "clases",
        label: "Clases por Semana",
        current: classesPerWeek,
        required: requiredClassesPerWeek,
        meets: classesPerWeek >= requiredClassesPerWeek,
      },
      {
        key: "localesEnLima",
        label: "Locales en Lima",
        current: metrics.totalLocations,
        required: catRequirements.localesEnLima,
        meets: metrics.totalLocations >= catRequirements.localesEnLima,
      },
      {
        key: "dobleteos",
        label: "Dobleteos",
        current: metrics.totalDoubleShifts,
        required: catRequirements.dobleteos,
        meets: metrics.totalDoubleShifts >= catRequirements.dobleteos,
      },
      {
        key: "horariosNoPrime",
        label: "Horarios No Prime",
        current: metrics.nonPrimeHours,
        required: catRequirements.horariosNoPrime,
        meets: metrics.nonPrimeHours >= catRequirements.horariosNoPrime,
      },
      {
        key: "participacionEventos",
        label: "Participación en Eventos",
        current: metrics.eventParticipation,
        required: catRequirements.participacionEventos,
        meets:
          !catRequirements.participacionEventos || metrics.eventParticipation,
      },
      {
        key: "lineamientos",
        label: "Cumple Lineamientos",
        current: metrics.meetsGuidelines,
        required: catRequirements.lineamientos,
        meets: !catRequirements.lineamientos || metrics.meetsGuidelines,
      },
    ];

    const allMeets = criteria.every((c) => c.meets);

    return {
      category: cat.type,
      categoryKey: cat.key,
      categoryLabel: cat.label,
      criteria,
      allMeets,
    };
  });
}
