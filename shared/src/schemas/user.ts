import { z } from 'zod';

// --- Response schemas ---

export const userProfileSchema = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  nationality: z.string().regex(/^[A-Z]{2}$/).nullable(),
  ukCitizenExemption: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// --- Input schemas ---

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).trim().optional(),
  lastName: z.string().min(1).max(100).trim().optional(),
  nationality: z.string().regex(/^[A-Z]{2}$/).nullable().optional(),
  ukCitizenExemption: z.boolean().optional(),
});

// --- Types ---

export type UserProfile = z.infer<typeof userProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
