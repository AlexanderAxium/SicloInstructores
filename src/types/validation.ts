/**
 * Zod validation schemas using centralized enums
 * Reusable validation schemas for consistent validation across the app
 */

import { z } from "zod";
import { LANGUAGE, USER_ROLE } from "./enums";

// User validation schemas
export const userRoleSchema = z.enum([
  USER_ROLE.SUPER_ADMIN,
  USER_ROLE.ADMIN,
  USER_ROLE.USER,
  USER_ROLE.VIEWER,
]);

export const languageSchema = z.enum([LANGUAGE.EN, LANGUAGE.ES, LANGUAGE.PT]);

// Common validation schemas
export const positiveNumberSchema = z.number().positive();
export const nonNegativeNumberSchema = z.number().min(0);
export const emailSchema = z.string().email();
export const passwordSchema = z.string().min(8);
export const phoneSchema = z.string().regex(/^\+?[\d\s\-()]+$/);

// String validation schemas
export const requiredStringSchema = z.string().min(1);
export const optionalStringSchema = z.string().optional();
