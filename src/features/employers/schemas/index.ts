import { z } from 'zod'

export const industryTypeSchema = z.enum([
  'plant_and_animal_cultivation',
  'fishing_and_pearling',
  'tree_farming_and_felling',
  'mining',
  'construction',
  'hospitality_and_tourism',
  'bushfire_recovery_work',
  'critical_covid19_work',
  'other'
])

export const createEmployerSchema = z.object({
  name: z
    .string()
    .min(2, 'Employer name must be at least 2 characters')
    .max(200, 'Employer name must be less than 200 characters')
    .trim(),
  industry: industryTypeSchema,
  postcode: z
    .string()
    .regex(/^\d{4}$/, 'Postcode must be 4 digits')
    .optional()
    .or(z.literal('')),
  is_eligible: z.boolean().default(true)
})

export type CreateEmployerFormData = z.infer<typeof createEmployerSchema>