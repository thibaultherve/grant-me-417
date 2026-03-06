import { z } from 'zod';

import { createEmployerSchema as baseSchema } from '@get-granted/shared';

import { validateSuburbId } from '../api/suburbs';

export const createEmployerSchema = baseSchema.extend({
  name: z
    .string()
    .min(2, 'Employer name must be at least 2 characters')
    .max(200, 'Employer name must be less than 200 characters')
    .trim(),
  suburbId: z
    .number({ message: 'Please select a suburb' })
    .int()
    .positive('Please select a valid suburb')
    .refine(
      async (suburbId) => {
        return await validateSuburbId(suburbId);
      },
      {
        message: 'Selected suburb does not exist',
      },
    ),
});

export type CreateEmployerFormData = z.input<typeof createEmployerSchema>;
