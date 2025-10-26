// Workshop-related types
export interface Workshop {
  id: string;
  name: string;
  instructorId: string;
  periodId: string;
  date: Date;
  comments?: string | null;
  payment: number;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
}

export interface WorkshopWithRelations extends Workshop {
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

// Theme Ride-related types
export interface ThemeRide {
  id: string;
  number: number;
  instructorId: string;
  periodId: string;
  comments?: string | null;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
}

export interface ThemeRideWithRelations extends ThemeRide {
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

// Branding-related types
export interface Branding {
  id: string;
  number: number;
  instructorId: string;
  periodId: string;
  comments?: string | null;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
}

export interface BrandingWithRelations extends Branding {
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
