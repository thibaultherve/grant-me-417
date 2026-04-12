import { z } from 'zod';
import { visaTypeSchema } from './visa';

// --- Sub-schemas ---

export const visaOverviewVisaSchema = z.object({
  id: z.string(),
  visaType: visaTypeSchema,
  arrivalDate: z.string(),
  expiryDate: z.string(),
  daysRequired: z.number().int(),
  eligibleDays: z.number().int(),
  daysWorked: z.number().int(),
  daysRemaining: z.number().int(),
  isEligible: z.boolean(),
});

export const visaOverviewPaceSchema = z.object({
  weeksElapsed: z.number().int(),
  weeksRemaining: z.number().int(),
  totalWeeks: z.number().int(),
  currentPace: z.number(),
  requiredPace: z.number(),
});

export const visaOverviewWeeklyProgressSchema = z.object({
  weekStartDate: z.string(),
  eligibleDays: z.number().int(),
  hours: z.number(),
  cumulativeEligibleDays: z.number().int(),
});

export const visaOverviewWorkDistributionSchema = z.object({
  industry: z.string(),
  totalHours: z.number(),
});

export const visaOverviewEmployerBreakdownSchema = z.object({
  employerId: z.string(),
  employerName: z.string(),
  isEligible: z.boolean(),
  totalHours: z.number(),
});

export const visaOverviewMonthlyTrendSchema = z.object({
  month: z.string(), // YYYY-MM
  eligibleDays: z.number().int(),
});

// --- Response schema ---

export const visaOverviewResponseSchema = z.object({
  visa: visaOverviewVisaSchema,
  pace: visaOverviewPaceSchema,
  weeklyProgress: z.array(visaOverviewWeeklyProgressSchema),
  workDistribution: z.array(visaOverviewWorkDistributionSchema),
  employerBreakdown: z.array(visaOverviewEmployerBreakdownSchema),
  monthlyTrend: z.array(visaOverviewMonthlyTrendSchema),
});

// --- Types ---

export type VisaOverviewVisa = z.infer<typeof visaOverviewVisaSchema>;
export type VisaOverviewPace = z.infer<typeof visaOverviewPaceSchema>;
export type VisaOverviewWeeklyProgress = z.infer<
  typeof visaOverviewWeeklyProgressSchema
>;
export type VisaOverviewWorkDistribution = z.infer<
  typeof visaOverviewWorkDistributionSchema
>;
export type VisaOverviewEmployerBreakdown = z.infer<
  typeof visaOverviewEmployerBreakdownSchema
>;
export type VisaOverviewMonthlyTrend = z.infer<
  typeof visaOverviewMonthlyTrendSchema
>;
export type VisaOverview = z.infer<typeof visaOverviewResponseSchema>;
