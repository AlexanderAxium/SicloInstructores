// Instructor-related types
export interface Instructor {
  id: string;
  name: string;
  fullName?: string | null;
  active: boolean;
  password?: string | null;
  extraInfo?: Record<string, unknown> | null;
  lastBonus?: Record<string, unknown> | null;

  // Optional contact and banking fields
  contactPerson?: string | null;
  bankAccount?: string | null;
  CCI?: string | null;
  bank?: string | null;
  phone?: string | null;
  DNI?: string | null;

  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
}

export interface InstructorCategory {
  id: string;
  instructorId: string;
  disciplineId: string;
  periodId: string;
  category: InstructorCategoryType;
  isManual: boolean;
  metrics?: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
}

export type InstructorCategoryType =
  | "INSTRUCTOR"
  | "JUNIOR_AMBASSADOR"
  | "AMBASSADOR"
  | "SENIOR_AMBASSADOR";

// Discipline interface
export interface Discipline {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
}

// Period interface
export interface Period {
  id: string;
  number: number;
  year: number;
  startDate: Date;
  endDate: Date;
  paymentDate: Date;
  bonusCalculated?: boolean | null;
  discountRules?: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
}

// Instructor with related data
export interface InstructorWithRelations extends Instructor {
  disciplines?: {
    id: string;
    name: string;
    color?: string | null;
    description?: string | null;
  }[];
  payments?: {
    id: string;
    amount: number;
    finalPayment: number;
    status: string;
    retention: number;
    adjustment: number;
    penalty: number;
    cover: number;
    branding: number;
    themeRide: number;
    workshop: number;
    versusBonus: number;
    bonus: number | null;
    comments?: string | null;
    period: {
      number: number;
      year: number;
      startDate: Date;
      endDate: Date;
    };
  }[];
  categories?: {
    id: string;
    category: string;
    isManual: boolean;
    metrics?: Record<string, unknown> | null;
    discipline: {
      name: string;
      color?: string | null;
    };
    period: {
      number: number;
      year: number;
    };
  }[];
}

// API-specific types (data comes as strings from API)
export interface InstructorFromAPI
  extends Omit<Instructor, "createdAt" | "updatedAt" | "tenantId"> {
  createdAt: string;
  updatedAt: string;
  tenantId?: string;
}

export interface DisciplineFromAPI
  extends Omit<Discipline, "createdAt" | "updatedAt"> {
  createdAt: string;
  updatedAt: string;
}

export interface PeriodFromAPI
  extends Omit<
    Period,
    | "startDate"
    | "endDate"
    | "paymentDate"
    | "createdAt"
    | "updatedAt"
    | "discountRules"
  > {
  startDate: string;
  endDate: string;
  paymentDate: string;
  createdAt: string;
  updatedAt: string;
  discountRules?: unknown;
}
