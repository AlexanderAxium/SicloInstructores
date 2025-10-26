// Types for statistics data based on Prisma schema and statistics router

// General statistics types (from getGeneral endpoint)
export interface GeneralStats {
  instructors: {
    total: number;
    active: number;
    inactive: number;
    withDisciplines: number;
    withoutDisciplines: number;
    new: number;
  };
  disciplines: {
    total: number;
    active: number;
    inactive: number;
  };
  classes: {
    total: number;
    averageOccupation: number;
    fullClasses: number;
    percentageFullClasses: number;
    totalReservations: number;
  };
  payments: {
    total: number;
    pending: number;
    paid: number;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    averageAmount: number;
    percentagePaid: number;
    percentagePending: number;
  };
}

// Instructor statistics types (from getInstructors endpoint)
export interface InstructorStats {
  topByEarnings: Array<{
    id: string;
    name: string;
    earnings: number;
    classes: number;
    reservations: number;
    totalCapacity: number;
    occupation: number;
  }>;
  topByClasses: Array<{
    id: string;
    name: string;
    earnings: number;
    classes: number;
    reservations: number;
    totalCapacity: number;
    occupation: number;
  }>;
  occupationDistribution: Array<{
    range: string;
    count: number;
  }>;
}

// Class statistics types (from getClasses endpoint)
export interface ClassStats {
  byDiscipline: Array<{
    disciplineId: string;
    name: string;
    color: string;
    count: number;
    averageOccupation: number;
  }>;
  byDay: Array<{
    day: number;
    name: string;
    count: number;
    reservations: number;
  }>;
  bySchedule: Array<{
    hour: string;
    count: number;
    reservations: number;
  }>;
  reservationsBySchedule: Array<{
    hour: string;
    reservations: number;
    averageOccupation: number;
  }>;
}

// Venue statistics types (from getVenues endpoint)
export interface VenueStats {
  totalVenues: number;
  mostUsed: Array<{
    name: string;
    count: number;
    averageOccupation: number;
    totalReservations: number;
    instructors: number;
  }>;
  occupationByVenue: Array<{
    name: string;
    occupation: number;
    classes: number;
  }>;
  earningsByVenue: Array<{
    name: string;
    earnings: number;
    classes: number;
    reservations: number;
    instructors: number;
  }>;
  disciplinesByVenue: Array<{
    name: string;
    disciplines: Array<{
      disciplineId: string;
      name: string;
      count: number;
      color: string;
    }>;
  }>;
}

export interface VenueStatistics {
  totalVenues: number;
  mostUsed: VenueUsage[];
  occupationByVenue: VenueOccupation[];
  earningsByVenue: VenueEarnings[];
  disciplinesByVenue: VenueDisciplines[];
}

export interface VenueUsage {
  name: string;
  count: number;
  averageOccupation: number;
  totalReservations: number;
  instructors: number;
}

export interface VenueOccupation {
  name: string;
  occupation: number;
  classes: number;
}

export interface VenueEarnings {
  name: string;
  earnings: number;
  classes: number;
  reservations: number;
  instructors: number;
}

export interface VenueDisciplines {
  name: string;
  disciplines: VenueDiscipline[];
}

export interface VenueDiscipline {
  disciplineId: string;
  name: string;
  count: number;
  color: string;
}

// Processed data types for the component (matching the actual data structure used)
export interface ProcessedVenueStats {
  masUsados: Array<{
    nombre: string;
    count: number;
    ocupacionPromedio: number;
    reservasTotales: number;
    instructores: number;
  }>;
  ocupacionPorSalon: Array<{
    nombre: string;
    ocupacion: number;
    clases: number;
  }>;
  ingresosPorSalon: Array<{
    nombre: string;
    ingresos: number;
    clases: number;
    reservas: number;
    instructores: number;
  }>;
  disciplinasPorSalon: Array<{
    nombre: string;
    disciplinas: Array<{
      disciplinaId: string;
      nombre: string;
      count: number;
      color: string;
    }>;
  }>;
}

export interface EstudioStats {
  nombre: string;
  clases: number;
  reservas: number;
  ocupacion: number;
  pagoTotal: number;
  instructores: number;
  disciplinas: number;
  porcentajeTotal: number;
  promedioPorClase: number;
}

export interface DisciplinaPorEstudio {
  disciplinaId: string;
  nombre: string;
  color: string;
  clases: number;
  porcentaje: number;
  ocupacion: number;
  pagoTotal: number;
  instructores: number;
  promedioPorClase: number;
}

export interface EstudioConDisciplinas {
  nombre: string;
  disciplinas: DisciplinaPorEstudio[];
}

// Chart data types
export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface OccupationChartDataPoint {
  name: string;
  ocupacion: number;
  clases: number;
}

// Export data types
export interface ExportEstudioData {
  Estudio: string;
  Clases: number;
  Reservas: number;
  "Ocupación (%)": number;
  "Pago Total": number;
  Instructores: number;
  Disciplinas: number;
  "% del Total": string;
  "Promedio por Clase": string;
}

export interface ExportDisciplinaData {
  Estudio: string;
  Disciplina: string;
  Clases: number | string;
  "Ocupación (%)": number | string;
  "Promedio/Clase": number | string;
  "Pago Total": number | string;
}
