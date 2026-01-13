import { z } from 'zod';

import { validateSuburbId } from '../api/suburbs';

const industryTypeSchema = z.enum([
  'plant_and_animal_cultivation',
  'fishing_and_pearling',
  'tree_farming_and_felling',
  'mining',
  'construction',
  'hospitality_and_tourism',
  'bushfire_recovery_work',
  'critical_covid19_work',
  'other',
]);

// Type dérivé du schéma Zod - source unique de vérité
export type IndustryType = z.infer<typeof industryTypeSchema>;

export const createEmployerSchema = z.object({
  name: z
    .string()
    .min(2, 'Employer name must be at least 2 characters')
    .max(200, 'Employer name must be less than 200 characters')
    .trim(),
  industry: industryTypeSchema,
  suburb_id: z
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
  is_eligible: z.boolean().default(true),
});

export type CreateEmployerFormData = z.input<typeof createEmployerSchema>;
