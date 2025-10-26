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

// Discipline and Period are now exported from instructor.ts to avoid duplication
