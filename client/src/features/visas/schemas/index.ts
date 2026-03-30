import { z } from 'zod';

import {
  createVisaSchema as baseCreateSchema,
  updateVisaSchema as baseUpdateSchema,
} from '@regranted/shared';

export const createVisaSchema = baseCreateSchema.extend({
  arrivalDate: z.string().min(1, 'Arrival date is required'),
});

export type CreateVisaFormData = z.infer<typeof createVisaSchema>;

export const updateVisaSchema = baseUpdateSchema.extend({
  arrivalDate: z.string().min(1, 'Arrival date is required'),
});

export type UpdateVisaFormData = z.infer<typeof updateVisaSchema>;
