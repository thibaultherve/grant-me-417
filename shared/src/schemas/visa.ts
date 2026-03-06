import { z } from 'zod';
import { VISA_TYPES } from '../constants/visa-rules.js';

// --- Shared ---

export const visaTypeSchema = z.enum(VISA_TYPES);
export type VisaType = z.infer<typeof visaTypeSchema>;

// --- Input schemas ---

export const createVisaSchema = z.object({
  visaType: visaTypeSchema,
  arrivalDate: z.string().min(1),
});

export const updateVisaSchema = z.object({
  arrivalDate: z.string().min(1),
});

// --- Response schemas ---

export const visaResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  visaType: visaTypeSchema,
  arrivalDate: z.string(),
  expiryDate: z.string(),
  daysRequired: z.number().int(),
  eligibleDays: z.number().int(),
  daysWorked: z.number().int(),
  progressPercentage: z.number(),
  isEligible: z.boolean(),
  daysRemaining: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const weeklyProgressSchema = z.object({
  id: z.string(),
  userVisaId: z.string(),
  weekStartDate: z.string(),
  weekEndDate: z.string(),
  hours: z.number(),
  eligibleHours: z.number(),
  eligibleDays: z.number().int(),
  daysWorked: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// --- Types ---

export type CreateVisaInput = z.infer<typeof createVisaSchema>;
export type UpdateVisaInput = z.infer<typeof updateVisaSchema>;
export type Visa = z.infer<typeof visaResponseSchema>;
/** @deprecated Use `Visa` instead */
export type VisaResponse = Visa;
export type WeeklyProgress = z.infer<typeof weeklyProgressSchema>;
