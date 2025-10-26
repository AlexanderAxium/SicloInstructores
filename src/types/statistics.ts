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

export interface InstructorStats {
  topByEarnings: Array<{
    id: string;
    name: string;
    earnings: number;
    classes: number;
    reservations: number;
    occupation: number;
  }>;
  topByClasses: Array<{
    id: string;
    name: string;
    earnings: number;
    classes: number;
    reservations: number;
    occupation: number;
  }>;
  occupationDistribution: Array<{
    range: string;
    count: number;
  }>;
}

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
