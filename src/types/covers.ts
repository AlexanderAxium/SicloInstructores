// Types for Cover system
export type CoverJustification = "PENDING" | "APPROVED" | "REJECTED";

export interface CoverFromAPI {
  id: string;
  originalInstructorId: string;
  replacementInstructorId: string;
  disciplineId: string;
  periodId: string;
  date: string | Date;
  time: string;
  classId?: string | null;
  justification: CoverJustification;
  bonusPayment: boolean;
  fullHousePayment: boolean;
  comments?: string | null;
  nameChange?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  tenantId?: string;

  // Relations
  originalInstructor?: {
    id: string;
    name: string;
    fullName?: string | null;
  };
  replacementInstructor?: {
    id: string;
    name: string;
    fullName?: string | null;
  };
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
  class?: {
    id: string;
    date: string | Date;
    studio: string;
    room: string;
    discipline?: {
      name: string;
      color?: string | null;
    };
  } | null;
}

export interface CreateCoverData {
  originalInstructorId: string;
  replacementInstructorId: string;
  disciplineId: string;
  periodId: string;
  date: string;
  time: string;
  classId?: string | null;
  comments?: string | null;
  nameChange?: string | null;
}

export interface UpdateCoverData {
  id: string;
  originalInstructorId?: string;
  replacementInstructorId?: string;
  disciplineId?: string;
  periodId?: string;
  date?: string;
  time?: string;
  classId?: string | null;
  justification?: CoverJustification;
  bonusPayment?: boolean;
  fullHousePayment?: boolean;
  comments?: string | null;
  nameChange?: string | null;
}

export interface CoverWithRelations extends CoverFromAPI {
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
  class?: {
    id: string;
    date: string | Date;
    studio: string;
    room: string;
    discipline?: {
      name: string;
      color?: string | null;
    };
  } | null;
}
