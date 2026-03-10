import { z } from 'zod';

// --- Input schemas ---

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(128),
  firstName: z.string().min(1).max(100).trim(),
  lastName: z.string().min(1).max(100).trim(),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

// --- Response schemas ---

export const authTokensSchema = z.object({
  accessToken: z.string(),
});

export const authUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
});

export const loginResponseSchema = z.object({
  user: authUserSchema,
  tokens: authTokensSchema,
});

export const registerResponseSchema = z.object({
  user: authUserSchema,
  tokens: authTokensSchema,
});

// --- Types ---

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AuthTokens = z.infer<typeof authTokensSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type RegisterResponse = z.infer<typeof registerResponseSchema>;
