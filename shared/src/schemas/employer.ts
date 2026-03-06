import { z } from 'zod';
import { INDUSTRY_TYPES } from '../constants/industries.js';
import { suburbWithPostcodeSchema } from './postcode.js';

// --- Shared ---

export const industryTypeSchema = z.enum(INDUSTRY_TYPES);
export type IndustryType = z.infer<typeof industryTypeSchema>;

// --- Input schemas ---

export const createEmployerSchema = z.object({
  name: z.string().min(2).max(200).trim(),
  industry: industryTypeSchema,
  suburbId: z.number().int().positive(),
  isEligible: z.boolean().optional().default(true),
});

export const updateEmployerSchema = z.object({
  name: z.string().min(2).max(200).trim().optional(),
  industry: industryTypeSchema.optional(),
  suburbId: z.number().int().positive().optional(),
  isEligible: z.boolean().optional(),
});

// --- Response schemas ---

export const employerResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  industry: industryTypeSchema,
  suburbId: z.number().int(),
  suburb: suburbWithPostcodeSchema,
  isEligible: z.boolean(),
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// --- Types ---

export type CreateEmployerInput = z.input<typeof createEmployerSchema>;
export type UpdateEmployerInput = z.infer<typeof updateEmployerSchema>;
export type Employer = z.infer<typeof employerResponseSchema>;
/** @deprecated Use `Employer` instead */
export type EmployerResponse = Employer;
