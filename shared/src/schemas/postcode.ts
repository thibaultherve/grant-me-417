import { z } from 'zod';

// --- Response schemas ---

export const postcodeSchema = z.object({
  postcode: z.string().regex(/^\d{4}$/),
  isRemoteVeryRemote: z.boolean(),
  isNorthernAustralia: z.boolean(),
  isRegionalAustralia: z.boolean(),
  isBushfireDeclared: z.boolean(),
  isNaturalDisasterDeclared: z.boolean(),
  lastUpdated: z.string().nullable(),
  lastScraped: z.string().nullable(),
});

export const postcodeBadgeDataSchema = z.object({
  isRemoteVeryRemote: z.boolean(),
  isNorthernAustralia: z.boolean(),
  isRegionalAustralia: z.boolean(),
  isBushfireDeclared: z.boolean(),
  isNaturalDisasterDeclared: z.boolean(),
});

export const suburbSchema = z.object({
  id: z.number().int(),
  suburbName: z.string(),
  postcode: z.string(),
  stateCode: z.string(),
});

export const suburbWithPostcodeSchema = suburbSchema.extend({
  postcodeData: postcodeBadgeDataSchema.nullable().optional(),
});

// --- Types ---

export type Postcode = z.infer<typeof postcodeSchema>;
export type PostcodeBadgeData = z.infer<typeof postcodeBadgeDataSchema>;
export type Suburb = z.infer<typeof suburbSchema>;
export type SuburbWithPostcode = z.infer<typeof suburbWithPostcodeSchema>;
