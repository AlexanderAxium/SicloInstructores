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

// Types for class creation
export interface CreateClassData {
  id?: string; // ID opcional para edición
  country: string;
  city: string;
  studio: string;
  room: string;
  spots: number;
  totalReservations: number;
  waitingLists: number;
  complimentary: number;
  paidReservations: number;
  specialText?: string;
  date: string;
  disciplineId: string;
  instructorId: string;
  periodId: string;
  week: number;
  isVersus: boolean;
  versusNumber?: number;
}

export interface UpdateClassData {
  id?: string; // ID opcional para edición
  country: string;
  city: string;
  studio: string;
  room: string;
  spots: number;
  totalReservations: number;
  waitingLists: number;
  complimentary: number;
  paidReservations: number;
  specialText?: string;
  date: string;
  isVersus: boolean;
  versusNumber?: number;
}

// Types for versus class creation
export interface VersusClassData extends CreateClassData {
  isVersus: true;
  versusNumber: number;
}

export interface VersusFormData {
  // Campos compartidos
  id?: string; // ID opcional para edición
  country: string;
  city: string;
  studio: string;
  room: string;
  spots: number;
  totalReservations: number;
  waitingLists: number;
  complimentary: number;
  paidReservations: number;
  specialText?: string;
  date: string;
  disciplineId: string;
  periodId: string;
  week: number;
  versusNumber: number;
  // Instructores para las clases versus
  instructors: string[];
}

// Dialog props types
export interface ClassDialogProps {
  classData: ClassFromAPI | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateClassData | UpdateClassData) => void;
  isLoading: boolean;
}

export interface VersusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: VersusClassData[], classesToDelete?: string[]) => void;
  isLoading: boolean;
  classData?: ClassFromAPI | null; // Para edición de clases versus existentes
  versusClasses?: ClassFromAPI[]; // Todas las clases versus relacionadas para edición
}

// API-specific types (data comes as strings from API)
export interface ClassFromAPI
  extends Omit<ClassWithRelations, "date" | "createdAt" | "updatedAt"> {
  date: string;
  createdAt: string;
  updatedAt: string;
}
