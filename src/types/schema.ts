// InstructorCategory type moved to instructor.ts to avoid duplication
import type { InstructorCategoryType } from "./instructor";

// Category requirements interface
export interface CategoryRequirements {
  occupancy: number;
  classes: number;
  locationsInLima: number;
  doubleShifts: number;
  nonPrimeHours: number;
  eventParticipation: boolean;
  minimumSeniority?: number;
  averageEvaluation?: number;
  completedTrainings?: number;
  guidelines: boolean; // Indicates if meets guidelines
}

// Payment parameters interface
export interface PaymentParameters {
  fixedQuota: number;
  guaranteedMinimum: number;
  tariffs: Array<{
    tariff: number;
    numberOfReservations: number;
  }>;
  fullHouseTariff: number;
  maximum: number;
  bonus: number;
  retentionPercentage?: number;
  adjustmentForDoubleShift?: number;
}

// Penalty discount rules interface
export interface PenaltyDiscountRules {
  allowedThreshold: number; // Percentage of classes allowed as threshold
  basePointsPerClass: number; // Base points per class to calculate threshold
  discountRules: {
    forExcessPoints: Array<{
      from: number;
      to: number;
      discountPercentage: number;
    }>;
  };
  penaltyTypes: Record<string, number | "variable">;
}

export interface Formula {
  id: string;
  disciplineId: string;
  periodId: string;
  categoryRequirements: Partial<
    Record<InstructorCategoryType, CategoryRequirements>
  >;
  paymentParameters: Partial<Record<InstructorCategoryType, PaymentParameters>>;
  penaltyDiscountRules?: PenaltyDiscountRules;
  createdAt: string;
  updatedAt: string;
  tenantId: string;
  discipline: {
    id: string;
    name: string;
    color?: string | null;
  };
  period: {
    id: string;
    number: number;
    year: number;
  };
}

// API-specific types (data comes as strings from API)
export interface FormulaFromAPI
  extends Omit<
    Formula,
    "categoryRequirements" | "paymentParameters" | "penaltyDiscountRules"
  > {
  categoryRequirements?: unknown;
  paymentParameters?: unknown;
  penaltyDiscountRules?: unknown;
}

// Response types for queries
export interface FormulasListResponse {
  formulas: FormulaFromAPI[];
  total: number;
  hasMore?: boolean;
}

// Spanish-named types (matching the form structure)
export interface CategoryRequirementsES {
  ocupacion: number;
  clases: number;
  localesEnLima: number;
  dobleteos: number;
  horariosNoPrime: number;
  participacionEventos: boolean;
  antiguedadMinima?: number;
  evaluacionPromedio?: number;
  capacitacionesCompletadas?: number;
  lineamientos: boolean;
  [key: string]: string | number | boolean | undefined;
}

export interface Tariff {
  tarifa: number;
  numeroReservas: number;
}

export interface PaymentParametersES {
  cuotaFija: number;
  minimoGarantizado: number;
  tarifas: Tariff[];
  tarifaFullHouse: number;
  maximo: number;
  bono: number;
  retencionPorcentaje?: number;
  ajustePorDobleteo?: number;
}

// Formula data structure for database (with JSON fields as string or parsed)
export interface FormulaDataFromDB {
  id: string;
  disciplineId: string;
  periodId: string;
  categoryRequirements: string | Record<string, CategoryRequirementsES>;
  paymentParameters: string | Record<string, PaymentParametersES>;
  createdAt: string;
  updatedAt: string;
  tenantId: string;
  discipline?: {
    id: string;
    name: string;
    color?: string | null;
  };
  period?: {
    id: string;
    number: number;
    year: number;
  };
}

// Types for select/list items
export interface DisciplineListItem {
  id: string;
  name: string;
  color?: string | null;
}

export interface PeriodListItem {
  id: string;
  number: number;
  year: number;
}

// Discipline and Period are now exported from instructor.ts to avoid duplication
