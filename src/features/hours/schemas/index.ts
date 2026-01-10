import { z } from 'zod';

// Helper function to parse hour formats (7.25 or 7:15)
const parseHoursString = (value: string): number => {
  // Handle decimal format (7.25)
  if (value.includes('.')) {
    return parseFloat(value);
  }

  // Handle time format (7:15)
  if (value.includes(':')) {
    const [hours, minutes] = value.split(':');
    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);

    if (isNaN(h) || isNaN(m) || m >= 60 || m < 0) {
      throw new Error('Invalid time format');
    }

    return h + m / 60;
  }

  // Handle plain number
  return parseFloat(value);
};

// Custom Zod transform for hours input
export const hoursInputSchema = z
  .string()
  .min(1, 'Hours is required')
  .transform((value, ctx) => {
    try {
      const hours = parseHoursString(value);

      if (isNaN(hours) || hours <= 0 || hours > 24) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Hours must be between 0.1 and 24',
        });
        return z.NEVER;
      }

      // Round to 2 decimal places
      return Math.round(hours * 100) / 100;
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid hours format. Use 7.25 or 7:15',
      });
      return z.NEVER;
    }
  });

// Date validation helpers
const isFutureDate = (date: string): boolean => {
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today
  return inputDate > today;
};

const isWeekStarted = (date: string): boolean => {
  const inputDate = new Date(date);
  const today = new Date();

  // Get the Monday of the input date's week
  const dayOfWeek = inputDate.getDay();
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Sunday = 0, Monday = 1
  const mondayOfWeek = new Date(inputDate);
  mondayOfWeek.setDate(inputDate.getDate() + daysToMonday);

  // Check if today is at least the Monday of that week
  return today >= mondayOfWeek;
};

// Schema for single work entry
export const workEntrySchema = z.object({
  work_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((date) => !isFutureDate(date), 'Cannot add hours for future dates'),
  hours_worked: hoursInputSchema,
});

// Schema for multiple work entries (By Day mode)
export const multipleWorkEntriesSchema = z.object({
  employer_id: z.string().uuid('Please select an employer'),
  entries: z
    .array(workEntrySchema)
    .min(1, 'At least one work entry is required')
    .max(31, 'Cannot add more than 31 entries at once'),
});

// Schema for By Week mode
export const weekWorkEntrySchema = z.object({
  employer_id: z.string().uuid('Please select an employer'),
  week_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((date) => !isFutureDate(date), 'Cannot add hours for future dates')
    .refine(
      (date) => isWeekStarted(date),
      'Cannot add hours for weeks that have not started yet',
    ),
  total_weekly_hours: z
    .string()
    .min(1, 'Total weekly hours is required')
    .transform((val) => parseFloat(val))
    .pipe(
      z
        .number()
        .positive('Total hours must be positive')
        .max(168, 'Maximum 168 hours per week (7 × 24)'),
    ),
  days_included: z
    .object({
      monday: z.boolean(),
      tuesday: z.boolean(),
      wednesday: z.boolean(),
      thursday: z.boolean(),
      friday: z.boolean(),
      saturday: z.boolean(),
      sunday: z.boolean(),
    })
    .refine(
      (days) => Object.values(days).filter(Boolean).length >= 1,
      'At least one day must be selected',
    )
    .refine((days) => {
      const selectedDays = Object.values(days).filter(Boolean).length;
      // Validation basique: au moins un jour sélectionné
      return selectedDays > 0;
    }, 'Too many hours for selected days (max 24h per day)'),
});

// Types for TypeScript
export type WorkEntryFormData = z.input<typeof workEntrySchema>;
export type MultipleWorkEntriesFormData = z.input<
  typeof multipleWorkEntriesSchema
>;
export type WeekWorkEntryFormData = z.input<typeof weekWorkEntrySchema>;

// Helper type for the days object
export type DaysIncluded = {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
};

// Re-export types from types/index.ts for backwards compatibility
export type { WorkEntryInput, WeekWorkEntryInput } from '../types';
