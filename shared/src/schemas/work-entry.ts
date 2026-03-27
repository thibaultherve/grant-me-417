import { z } from 'zod';
import { MAX_HOURS_PER_DAY } from '../constants/visa-rules.js';
import { createPaginatedSchema } from './common.js';
import { industryTypeSchema } from './employer.js';
import { visaPeriodSchema, visaTypeSchema } from './visa.js';

// --- Input schemas (multi-employer batch) ---

export const saveWeekBatchEntrySchema = z.object({
  employerId: z.string().uuid(),
  hours: z.record(z.string(), z.number().min(0).max(MAX_HOURS_PER_DAY)),
});

export const saveWeekBatchSchema = z.object({
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'weekStart must be a valid ISO date (YYYY-MM-DD)'),
  entries: z.array(saveWeekBatchEntrySchema),
});

// --- Response schemas ---

export const workEntryResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  employerId: z.string(),
  workDate: z.string(),
  hours: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const workEntryWithEmployerSchema = workEntryResponseSchema.extend({
  employerName: z.string(),
  industry: industryTypeSchema,
  isEligible: z.boolean(),
});

export const hoursResponseSchema = createPaginatedSchema(workEntryWithEmployerSchema);

export const dayHoursEntrySchema = z.object({
  employerName: z.string(),
  hours: z.number(),
});

export const monthHoursResponseSchema = z.record(
  z.string(),
  z.array(dayHoursEntrySchema),
);

// --- Weekly response schemas ---

export const weeklyEmployerSchema = z.object({
  employerId: z.string(),
  employerName: z.string(),
  industry: industryTypeSchema,
  isEligible: z.boolean(),
  totalHours: z.number(),
  dailyHours: z.record(z.string(), z.number()),
});

export const weekVisaBreakdownSchema = z.object({
  visaId: z.string(),
  visaType: visaTypeSchema,
  eligibleHours: z.number(),
  eligibleDays: z.number(),
  daysWorked: z.number(),
});

export const weekDataSchema = z.object({
  weekStart: z.string(),
  weekEnd: z.string(),
  dates: z.array(z.string()),
  totalHours: z.number(),
  visaBreakdown: z.array(weekVisaBreakdownSchema),
  employers: z.array(weeklyEmployerSchema),
  dailyTotals: z.record(z.string(), z.number()),
});

export const weeklyHoursResponseSchema = z.object({
  weeks: z.array(weekDataSchema),
  visas: z.array(visaPeriodSchema),
});

// --- Batch week response schemas (multi-employer) ---

export const weekEmployerEntrySchema = z.object({
  employerId: z.string(),
  employerName: z.string(),
  industry: industryTypeSchema,
  isEligible: z.boolean(),
  hours: z.record(z.string(), z.number()),
  total: z.number(),
});

export const weekEntriesResponseSchema = z.object({
  weekStart: z.string(),
  employers: z.array(weekEmployerEntrySchema),
});

// --- Types ---

export type WorkEntry = z.infer<typeof workEntryResponseSchema>;
export type WorkEntryWithEmployer = z.infer<typeof workEntryWithEmployerSchema>;
export type HoursList = z.infer<typeof hoursResponseSchema>;
export type DayHoursEntry = z.infer<typeof dayHoursEntrySchema>;
export type MonthHours = z.infer<typeof monthHoursResponseSchema>;
/** @deprecated Use `WorkEntry` instead */
export type WorkEntryResponse = WorkEntry;
/** @deprecated Use `HoursList` instead */
export type HoursResponse = HoursList;
export type WeeklyEmployer = z.infer<typeof weeklyEmployerSchema>;
export type WeekVisaBreakdown = z.infer<typeof weekVisaBreakdownSchema>;
export type WeekData = z.infer<typeof weekDataSchema>;
export type WeeklyHoursResponse = z.infer<typeof weeklyHoursResponseSchema>;
/** @deprecated Use `MonthHours` instead */
export type MonthHoursResponse = MonthHours;
export type SaveWeekBatchEntry = z.infer<typeof saveWeekBatchEntrySchema>;
export type SaveWeekBatch = z.infer<typeof saveWeekBatchSchema>;
export type WeekEmployerEntry = z.infer<typeof weekEmployerEntrySchema>;
export type WeekEntriesResponse = z.infer<typeof weekEntriesResponseSchema>;
