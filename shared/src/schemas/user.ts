import { z } from 'zod';
import { ELIGIBLE_COUNTRIES } from '../constants/visa-rules.js';

// --- Response schemas ---

export const userProfileSchema = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string(),
  nationality: z.enum(ELIGIBLE_COUNTRIES),
  whvType: z.enum(['417', '462']),
  ukCitizenExemption: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// --- Input schemas ---

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).trim().optional(),
  nationality: z.enum(ELIGIBLE_COUNTRIES).optional(),
});

// --- Types ---

export type UserProfile = z.infer<typeof userProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
