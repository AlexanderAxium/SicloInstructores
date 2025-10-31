/**
 * Configuration file with hardcoded values for the application
 * Includes non-prime hours by studio, disciplines without visual categorization, etc.
 */

// Define types for better type safety
type HorarioRecord = Record<string, boolean>;
type EstudioRecord = Record<string, HorarioRecord>;

// Non-prime (non-star) hours by studio
export const HORARIOS_NO_PRIME: EstudioRecord = {
  // Format: { studio: { hour: boolean } }
  // Hours must be in 24-hour format (HH:MM)
  Reducto: {
    "08:00": true,
    "09:00": true,
    "13:00": true,
    "18:00": true, // 6:00pm (pending vote)
  },
  "San Isidro": {
    "09:00": true,
    "13:00": true,
  },
  Primavera: {
    "09:00": true,
    "13:00": true,
    "18:00": true,
  },
  Estancia: {
    "06:00": true,
    "09:15": true,
    "18:00": true,
  },
};

// Disciplines that don't apply for visual categorization display
// These disciplines won't show the instructor category in the UI, though it will be calculated internally
export const DISCIPLINES_WITHOUT_VISUAL_CATEGORY = [
  "Barre",
  "Yoga",
  "Ejercito",
];

// Retention value for payments (percentage expressed as decimal)
export const RETENTION_VALUE = 0.08; // 8%

// Instructor categories configuration
export const CATEGORIES_CONFIG = {
  // Display names for UI (can be in any language)
  DISPLAY_NAMES: {
    INSTRUCTOR: "Instructor",
    JUNIOR_AMBASSADOR: "Embajador Junior",
    AMBASSADOR: "Embajador",
    SENIOR_AMBASSADOR: "Embajador Senior",
  },
  // Badge colors for category display
  BADGE_COLORS: {
    INSTRUCTOR: "bg-gray-100 text-gray-800 border-gray-200",
    JUNIOR_AMBASSADOR: "bg-teal-100 text-teal-800 border-teal-200",
    AMBASSADOR: "bg-blue-100 text-blue-800 border-blue-200",
    SENIOR_AMBASSADOR: "bg-purple-100 text-purple-800 border-purple-200",
  },
  // Category priority order (from highest to lowest)
  PRIORITY_ORDER: [
    "SENIOR_AMBASSADOR",
    "AMBASSADOR",
    "JUNIOR_AMBASSADOR",
    "INSTRUCTOR",
  ],
};

/**
 * Check if a schedule is non-prime for a specific studio
 */
export function isNonPrimeHour(estudio: string, hora: string): boolean {
  return isNonPrimeHourInternal(estudio, hora);
}

/**
 * Check if a schedule is non-prime for a specific studio (internal helper)
 */
function isNonPrimeHourInternal(estudio: string, hora: string): boolean {
  // Normalize the hour to HH:MM format
  let horaNormalizada = hora;

  // If the hour comes in 12-hour format (with am/pm), convert it to 24-hour format
  if (hora.toLowerCase().includes("am") || hora.toLowerCase().includes("pm")) {
    const [horaStr, minutos] = hora.replace(/[^\d:]/g, "").split(":");
    let horaNum = Number.parseInt(horaStr ?? "0", 10);

    if (hora.toLowerCase().includes("pm") && horaNum < 12) {
      horaNum += 12;
    } else if (hora.toLowerCase().includes("am") && horaNum === 12) {
      horaNum = 0;
    }

    horaNormalizada = `${horaNum.toString().padStart(2, "0")}:${minutos || "00"}`;
  }

  // Loop through all entries in HORARIOS_NO_PRIME
  for (const [estudioConfig, horarios] of Object.entries(HORARIOS_NO_PRIME)) {
    // Check if the configuration studio name is contained in the provided studio
    if (estudio.toLowerCase().includes(estudioConfig.toLowerCase())) {
      // If studio matches, check if the hour is in the non-prime hours list
      if (horarios[horaNormalizada]) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Check if a discipline should display visual category
 */
export function shouldShowVisualCategory(disciplina: string): boolean {
  return !DISCIPLINES_WITHOUT_VISUAL_CATEGORY.includes(disciplina);
}

/**
 * Check if a discipline should display visual category (Spanish function name for backwards compatibility)
 */
export function mostrarCategoriaVisual(disciplina: string): boolean {
  return shouldShowVisualCategory(disciplina);
}

// Spanish name compatibility exports
export const DISCIPLINAS_SIN_CATEGORIA_VISUAL =
  DISCIPLINES_WITHOUT_VISUAL_CATEGORY;
export const RETENCION_VALOR = RETENTION_VALUE;
export const CATEGORIAS_CONFIG = CATEGORIES_CONFIG;
export function esHorarioNoPrime(estudio: string, hora: string): boolean {
  return isNonPrimeHour(estudio, hora);
}

// Export all configurations as a single object for easier imports
export const CONFIG = {
  HORARIOS_NO_PRIME,
  DISCIPLINES_WITHOUT_VISUAL_CATEGORY,
  RETENTION_VALUE,
  CATEGORIES_CONFIG,
  isNonPrimeHour,
  shouldShowVisualCategory,
};

export default CONFIG;
