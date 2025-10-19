/**
 * Type-safe enums and constants for the application
 * Centralized management of all enum values and their types
 */

// User Role Enum
export const USER_ROLE = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  USER: "user",
  VIEWER: "viewer",
} as const;

// Language Enum
export const LANGUAGE = {
  EN: "EN",
  ES: "ES",
  PT: "PT",
} as const;

// Type definitions derived from the constants
export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];
export type Language = (typeof LANGUAGE)[keyof typeof LANGUAGE];

// Helper functions for validation
export const isValidUserRole = (role: string): role is UserRole => {
  return Object.values(USER_ROLE).includes(role as UserRole);
};

export const isValidLanguage = (lang: string): lang is Language => {
  return Object.values(LANGUAGE).includes(lang as Language);
};
