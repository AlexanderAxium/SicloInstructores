// Payment-related types
export interface InstructorPayment {
  id: string;
  amount: number;
  status: string;
  instructorId: string;
  periodId: string;
  retention: number;
  adjustment: number;
  penalty: number;
  cover: number;
  branding: number;
  themeRide: number;
  workshop: number;
  versusBonus: number;
  adjustmentType: string;
  bonus?: number | null;
  finalPayment: number;
  comments?: string | null;
  details?: Record<string, unknown> | null;
  meetsGuidelines?: boolean | null;
  doubleShifts?: number | null;
  nonPrimeHours?: number | null;
  eventParticipation?: boolean | null;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
}

export interface PaymentWithRelations extends InstructorPayment {
  instructor: {
    id: string;
    name: string;
    fullName?: string | null;
  };
  period: {
    id: string;
    number: number;
    year: number;
  };
}

// Penalty-related types
export interface Penalty {
  id: string;
  instructorId: string;
  disciplineId?: string | null;
  periodId: string;
  type: PenaltyType;
  points: number;
  description?: string | null;
  active: boolean;
  appliedAt: Date;
  comments?: string | null;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
}

export type PenaltyType =
  | "FIXED_CANCELLATION"
  | "OUT_OF_TIME_CANCELLATION"
  | "CANCEL_LESS_24HRS"
  | "COVER_OF_COVER"
  | "LATE_EXIT"
  | "CUSTOM";

export interface PenaltyWithRelations extends Penalty {
  instructor: {
    id: string;
    name: string;
    fullName?: string | null;
  };
  discipline?: {
    id: string;
    name: string;
    color?: string | null;
  } | null;
  period: {
    id: string;
    number: number;
    year: number;
  };
}

// API-specific types (data comes as strings from API)
export interface InstructorPaymentFromAPI
  extends Omit<InstructorPayment, "createdAt" | "updatedAt"> {
  createdAt: string;
  updatedAt: string;
}

export interface PenaltyFromAPI
  extends Omit<Penalty, "appliedAt" | "createdAt" | "updatedAt"> {
  appliedAt: string;
  createdAt: string;
  updatedAt: string;
}

// Payment with relations from API
export interface InstructorPaymentWithRelationsFromAPI
  extends InstructorPaymentFromAPI {
  instructor?: {
    id: string;
    name: string;
    fullName?: string | null;
    phone?: string | null;
    DNI?: string | null;
  };
  period?: {
    id: string;
    number: number;
    year: number;
    startDate?: string;
    endDate?: string;
  };
}

// Response types for queries
export interface PaymentsListResponse {
  payments: InstructorPaymentWithRelationsFromAPI[];
  total: number;
  hasMore: boolean;
}
