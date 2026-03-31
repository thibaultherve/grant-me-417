import { z } from 'zod';
import { createPaginatedSchema } from './common.js';
import { ZONE_TYPES } from '../constants/visa-rules.js';

export const AUSTRALIAN_STATES = [
  'NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT',
] as const;

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

// --- Paginated Directory (new) ---

export const paginatedDirectoryQuerySchema = z.object({
  visaType: z.enum(['417', '462']),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(15),
  search: z.string().max(100).trim().optional(),
  states: z
    .union([
      z.array(z.enum(AUSTRALIAN_STATES)).max(10),
      z.string().max(40).transform((s) => s.split(',')).pipe(z.array(z.enum(AUSTRALIAN_STATES)).max(10)),
    ])
    .optional(),
  zones: z
    .union([
      z.array(z.enum(ZONE_TYPES)).max(6),
      z.string().max(60).transform((s) => s.split(',')).pipe(z.array(z.enum(ZONE_TYPES)).max(6)),
    ])
    .optional(),
  favorites: z
    .union([z.boolean(), z.string().transform((s) => s === 'true')])
    .optional(),
  sort: z.enum(['asc', 'desc']).default('asc'),
});

export const paginatedDirectoryItemSchema = z.object({
  postcode: z.string().regex(/^\d{4}$/),
  stateCode: z.string(),
  zones: z.array(z.string()),
  suburbs: z.array(z.string()),
  isFavorite: z.boolean(),
});

export const paginatedDirectoryResponseSchema = createPaginatedSchema(
  paginatedDirectoryItemSchema,
);

// --- Postcode Detail (new) ---

export const postcodeDetailResponseSchema = z.object({
  postcode: z.string().regex(/^\d{4}$/),
  lastUpdated: z.string().nullable(),
  suburbs: z.array(suburbSchema),
  eligibility417: postcodeBadgeDataSchema.nullable(),
  eligibility462: postcodeBadgeDataSchema.nullable(),
  history: z.array(
    z.object({
      effectiveDate: z.string(),
      category: z.string(),
      action: z.enum(['ENTERED', 'LEFT']),
      visaType: z.enum(['417', '462']),
    }),
  ),
});

// --- Global Changes (new) ---

export const globalChangesQuerySchema = z.object({
  visaType: z.enum(['417', '462']),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const globalChangeEntrySchema = z.object({
  effectiveDate: z.string(),
  zone: z.string(),
  action: z.enum(['Added', 'Deleted']),
  postcodes: z.array(
    z.object({
      postcode: z.string().regex(/^\d{4}$/),
      stateCode: z.string(),
    }),
  ),
  sourceUrl: z.string().nullable(),
});

export const globalChangesResponseSchema = createPaginatedSchema(
  globalChangeEntrySchema,
);

// --- Last Update Info (new) ---

export const lastUpdateResponseSchema = z.object({
  lastUpdateDate: z.string().nullable(),
  sourceUrl: z.string().nullable(),
});

// --- Search & Suburb ID (controller-level validation) ---

export const searchQuerySchema = z.object({
  q: z.string().max(100).trim().default(''),
});

export const suburbIdParamSchema = z.object({
  id: z.coerce.number().int().min(1),
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

export type PaginatedDirectoryQuery = z.infer<typeof paginatedDirectoryQuerySchema>;
export type PaginatedDirectoryItem = z.infer<typeof paginatedDirectoryItemSchema>;
export type PaginatedDirectoryResponse = z.infer<typeof paginatedDirectoryResponseSchema>;
export type PostcodeDetailResponse = z.infer<typeof postcodeDetailResponseSchema>;
export type GlobalChangesQuery = z.infer<typeof globalChangesQuerySchema>;
export type GlobalChangeEntry = z.infer<typeof globalChangeEntrySchema>;
export type GlobalChangesResponse = z.infer<typeof globalChangesResponseSchema>;
export type LastUpdateResponse = z.infer<typeof lastUpdateResponseSchema>;
