// Tipos centralizados para usuario - INTERFAZ PRINCIPAL
export interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  image?: string | null;
  phone?: string | null;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interfaz simplificada para autenticación (sin campos sensibles)
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  image?: string | null;
  emailVerified: boolean;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

// JWT payload interface
export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}
