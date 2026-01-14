import { z } from 'zod';

export const createVisaSchema = z.object({
  visa_type: z.enum(['first_whv', 'second_whv', 'third_whv']),
  arrival_date: z.string().min(1, 'Arrival date is required'),
});

export type CreateVisaFormData = z.infer<typeof createVisaSchema>;

export const updateVisaSchema = z.object({
  arrival_date: z.string().min(1, 'Arrival date is required'),
});

export type UpdateVisaFormData = z.infer<typeof updateVisaSchema>;
