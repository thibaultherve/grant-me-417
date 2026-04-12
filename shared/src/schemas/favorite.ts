import { z } from 'zod';

// --- Toggle favorite postcode (request body) ---

export const toggleFavoritePostcodeSchema = z.object({
  postcode: z.string().regex(/^\d{4}$/),
});

// --- Favorite postcode response ---

export const favoritePostcodeResponseSchema = z.object({
  postcode: z.string().regex(/^\d{4}$/),
  createdAt: z.string().datetime(),
});

// --- Types ---

export type ToggleFavoritePostcodeInput = z.infer<
  typeof toggleFavoritePostcodeSchema
>;
export type FavoritePostcodeResponse = z.infer<
  typeof favoritePostcodeResponseSchema
>;
