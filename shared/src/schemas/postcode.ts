import { z } from 'zod';

// --- Postcode (pure reference, no eligibility flags) ---

export const postcodeSchema = z.object({
  postcode: z.string().regex(/^\d{4}$/),
  lastUpdated: z.string().nullable(),
});

// --- Eligibility data (per visa type) ---

export const postcodeBadgeDataSchema = z.object({
  isRemoteVeryRemote: z.boolean(),
  isNorthernAustralia: z.boolean(),
  isRegionalAustralia: z.boolean(),
  isBushfireDeclared: z.boolean(),
  isNaturalDisasterDeclared: z.boolean(),
});

export const postcodeEligibilitySchema = postcodeBadgeDataSchema.extend({
  postcode: z.string().regex(/^\d{4}$/),
  visaType: z.enum(['417', '462']),
  lastScraped: z.string().nullable().optional(),
});

// --- Directory & History schemas ---

export const postcodeDirectoryEntrySchema = z.object({
  postcode: z.string().regex(/^\d{4}$/),
  isRemoteVeryRemote: z.boolean(),
  isNorthernAustralia: z.boolean(),
  isRegionalAustralia: z.boolean(),
  isBushfireDeclared: z.boolean(),
  isNaturalDisasterDeclared: z.boolean(),
});

export const postcodeHistoryEntrySchema = z.object({
  effectiveDate: z.string(),
  category: z.string(),
  action: z.enum(['ENTERED', 'LEFT']),
  sourceType: z.string(),
});

export const postcodeParamSchema = z.object({
  postcode: z.string().regex(/^\d{4}$/),
});

export const postcodeDirectoryQuerySchema = z.object({
  visaType: z.enum(['417', '462']),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

// --- Suburb schemas ---

export const suburbSchema = z.object({
  id: z.number().int(),
  suburbName: z.string(),
  postcode: z.string().regex(/^\d{4}$/),
  stateCode: z.string(),
});

export const suburbWithPostcodeSchema = suburbSchema.extend({
  postcodeData: postcodeBadgeDataSchema.nullable().optional(),
});

// --- Types ---

export type Postcode = z.infer<typeof postcodeSchema>;
export type PostcodeBadgeData = z.infer<typeof postcodeBadgeDataSchema>;
export type PostcodeEligibility = z.infer<typeof postcodeEligibilitySchema>;
export type PostcodeDirectoryEntry = z.infer<
  typeof postcodeDirectoryEntrySchema
>;
export type PostcodeHistoryEntry = z.infer<typeof postcodeHistoryEntrySchema>;
export type PostcodeDirectoryQuery = z.infer<
  typeof postcodeDirectoryQuerySchema
>;
export type Suburb = z.infer<typeof suburbSchema>;
export type SuburbWithPostcode = z.infer<typeof suburbWithPostcodeSchema>;
