import { z } from 'zod';
import { VISA_TYPES } from '../constants/visa-rules.js';

// --- Shared ---

export const visaTypeSchema = z.enum(VISA_TYPES);
export type VisaType = z.infer<typeof visaTypeSchema>;

// --- Input schemas ---

const isoDateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'arrivalDate must be a valid ISO date (YYYY-MM-DD)');

export const createVisaSchema = z.object({
  visaType: visaTypeSchema,
  arrivalDate: isoDateString,
});

export const updateVisaSchema = z.object({
  arrivalDate: isoDateString,
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

export const visaPeriodSchema = z.object({
  id: z.string(),
  visaType: visaTypeSchema,
  arrivalDate: z.string(),
  expiryDate: z.string(),
});

// --- Types ---

export type CreateVisaInput = z.infer<typeof createVisaSchema>;
export type UpdateVisaInput = z.infer<typeof updateVisaSchema>;
export type Visa = z.infer<typeof visaResponseSchema>;
/** @deprecated Use `Visa` instead */
export type VisaResponse = Visa;
export type VisaPeriod = z.infer<typeof visaPeriodSchema>;
export type WeeklyProgress = z.infer<typeof weeklyProgressSchema>;
