import { z } from 'zod';
import { INDUSTRY_TYPES } from '../constants/industries.js';
import { suburbWithPostcodeSchema } from './postcode.js';

// --- Shared ---

export const industryTypeSchema = z.enum(INDUSTRY_TYPES);
export type IndustryType = z.infer<typeof industryTypeSchema>;

// --- Eligibility mode ---

export const eligibilityModeSchema = z.enum(['automatic', 'manual']);
export type EligibilityMode = z.infer<typeof eligibilityModeSchema>;

// --- Input schemas ---

export const createEmployerSchema = z.object({
  name: z.string().min(2).max(200).trim(),
  industry: industryTypeSchema,
  suburbId: z.number().int().positive(),
  eligibilityMode: eligibilityModeSchema.default('automatic'),
  isEligible: z.boolean().optional(),
});

export const updateEmployerSchema = z.object({
  name: z.string().min(2).max(200).trim().optional(),
  industry: industryTypeSchema.optional(),
  suburbId: z.number().int().positive().optional(),
  eligibilityMode: eligibilityModeSchema.optional(),
  isEligible: z.boolean().optional(),
});

// --- Check eligibility schemas ---

export const checkEligibilityInputSchema = z.object({
  suburbId: z.number().int().positive(),
  industry: industryTypeSchema,
});

export const checkEligibilityOutputSchema = z.object({
  isEligible: z.boolean(),
});

// --- Response schemas ---

export const employerResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  industry: industryTypeSchema,
  suburbId: z.number().int(),
  suburb: suburbWithPostcodeSchema,
  isEligible: z.boolean(),
  eligibilityMode: eligibilityModeSchema,
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// --- Types ---

export type CreateEmployerInput = z.input<typeof createEmployerSchema>;
export type UpdateEmployerInput = z.infer<typeof updateEmployerSchema>;
export type CheckEligibilityInput = z.infer<typeof checkEligibilityInputSchema>;
export type CheckEligibilityOutput = z.infer<typeof checkEligibilityOutputSchema>;
export type Employer = z.infer<typeof employerResponseSchema>;
/** @deprecated Use `Employer` instead */
export type EmployerResponse = Employer;
