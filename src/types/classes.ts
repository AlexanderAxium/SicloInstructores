// Class-related types
export interface Class {
  id: string;
  country: string;
  city: string;
  disciplineId: string;
  week: number;
  studio: string;
  instructorId: string;
  periodId: string;
  room: string;
  totalReservations: number;
  waitingLists: number;
  complimentary: number;
  spots: number;
  paidReservations: number;
  specialText?: string | null;
  date: Date;
  replacementInstructorId?: string | null;
  penaltyType?: string | null;
  penaltyPoints?: number | null;
  isVersus: boolean;
  versusNumber?: number | null;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
}

// Cover-related types
export interface Cover {
  id: string;
  originalInstructorId: string;
  replacementInstructorId: string;
  disciplineId: string;
  periodId: string;
  date: Date;
  time: string;
  classId?: string | null;
  justification: string;
  bonusPayment: boolean;
  fullHousePayment: boolean;
  comments?: string | null;
  nameChange?: string | null;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
}

// Cover with relations
export interface CoverWithRelations extends Cover {
  originalInstructor: {
    id: string;
    name: string;
    fullName?: string | null;
  };
  replacementInstructor: {
    id: string;
    name: string;
    fullName?: string | null;
  };
  class?: {
    id: string;
    date: Date;
    studio: string;
    room: string;
    discipline: {
      name: string;
      color?: string | null;
    };
  } | null;
  period: {
    id: string;
    number: number;
    year: number;
  };
}

// Class with relations
export interface ClassWithRelations extends Class {
  instructor: {
    id: string;
    name: string;
    fullName?: string | null;
  };
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
  covers?: Cover[];
}
