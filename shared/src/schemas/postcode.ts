import { z } from 'zod';
import { AUSTRALIAN_STATES } from '../constants/states';
import { ZONE_TYPES } from '../constants/visa-eligibility';
import { createPaginatedSchema } from './common';
import { visaSubclassEnum } from './visa';

// --- Shared primitives ---

export const postcodeString = z.string().regex(/^\d{4}$/);
const historyActionEnum = z.enum(['ENTERED', 'LEFT']);

// --- Postcode (pure reference, no eligibility flags) ---

export const postcodeSchema = z.object({
  postcode: postcodeString,
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
  postcode: postcodeString,
  visaType: visaSubclassEnum,
  lastScraped: z.string().nullable().optional(),
});

// --- History schemas ---

export const postcodeHistoryEntrySchema = z.object({
  effectiveDate: z.string(),
  category: z.string(),
  action: historyActionEnum,
  sourceType: z.string(),
});

export const postcodeParamSchema = z.object({
  postcode: postcodeString,
});

export const visaTypeQuerySchema = z.object({
  visaType: visaSubclassEnum,
});

// --- Suburb schemas ---

export const suburbSchema = z.object({
  id: z.number().int(),
  suburbName: z.string(),
  postcode: postcodeString,
  stateCode: z.string(),
});

export const suburbWithPostcodeSchema = suburbSchema.extend({
  postcodeData: postcodeBadgeDataSchema.nullable().optional(),
});

// --- Paginated Directory (new) ---

export const paginatedDirectoryQuerySchema = z.object({
  visaType: visaSubclassEnum,
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(15),
  search: z.string().max(100).trim().optional(),
  states: z
    .union([
      z.array(z.enum(AUSTRALIAN_STATES)).max(10),
      z
        .string()
        .max(40)
        .transform((s) => s.split(','))
        .pipe(z.array(z.enum(AUSTRALIAN_STATES)).max(10)),
    ])
    .optional(),
  zones: z
    .union([
      z.array(z.enum(ZONE_TYPES)).max(6),
      z
        .string()
        .max(60)
        .transform((s) => s.split(','))
        .pipe(z.array(z.enum(ZONE_TYPES)).max(6)),
    ])
    .optional(),
  favorites: z
    .union([z.boolean(), z.string().transform((s) => s === 'true')])
    .optional(),
  sort: z.enum(['asc', 'desc']).default('asc'),
});

export const paginatedDirectoryItemSchema = z.object({
  postcode: postcodeString,
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
  postcode: postcodeString,
  lastUpdated: z.string().nullable(),
  suburbs: z.array(suburbSchema),
  eligibility417: postcodeBadgeDataSchema.nullable(),
  eligibility462: postcodeBadgeDataSchema.nullable(),
  history: z.array(
    z.object({
      effectiveDate: z.string(),
      category: z.string(),
      action: historyActionEnum,
      visaType: visaSubclassEnum,
    }),
  ),
});

// --- Global Changes (sidebar format — date-grouped with state counts) ---

export const globalChangesQuerySchema = z.object({
  visaType: visaSubclassEnum,
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const globalChangeStatCountSchema = z.object({
  stateCode: z.string(),
  count: z.number().int(),
});

export const globalChangeItemSchema = z.object({
  zone: z.string(),
  action: z.enum(['Added', 'Deleted']),
  stateCounts: z.array(globalChangeStatCountSchema),
});

export const globalChangeEntrySchema = z.object({
  date: z.string(),
  changes: z.array(globalChangeItemSchema),
});

export const globalChangesResponseSchema = createPaginatedSchema(
  globalChangeEntrySchema,
);

// --- Change Detail (full postcodes for a specific change date) ---

export const changeDetailParamSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((s) => !isNaN(new Date(s).getTime()), {
      message: 'Invalid calendar date',
    }),
});

export const changeDetailQuerySchema = z.object({
  visaType: visaSubclassEnum.default('417'),
});

export const changeDetailResponseSchema = z.object({
  date: z.string(),
  totalAffected: z.number().int(),
  sourceUrl: z.string().nullable(),
  changes: z.array(
    z.object({
      zone: z.string(),
      action: z.enum(['Added', 'Deleted']),
      postcodes: z.array(
        z.object({
          postcode: postcodeString,
          stateCode: z.string(),
        }),
      ),
    }),
  ),
});

// --- Last Update Info (new) ---

export const lastUpdateQuerySchema = z.object({
  visaType: visaSubclassEnum.default('417'),
});

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
export type PostcodeHistoryEntry = z.infer<typeof postcodeHistoryEntrySchema>;
export type SuburbWithPostcode = z.infer<typeof suburbWithPostcodeSchema>;
export type PaginatedDirectoryQuery = z.infer<
  typeof paginatedDirectoryQuerySchema
>;
export type PaginatedDirectoryItem = z.infer<
  typeof paginatedDirectoryItemSchema
>;
export type PaginatedDirectoryResponse = z.infer<
  typeof paginatedDirectoryResponseSchema
>;
export type PostcodeDetailResponse = z.infer<
  typeof postcodeDetailResponseSchema
>;
export type GlobalChangesQuery = z.infer<typeof globalChangesQuerySchema>;
export type GlobalChangeEntry = z.infer<typeof globalChangeEntrySchema>;
export type GlobalChangesResponse = z.infer<typeof globalChangesResponseSchema>;
export type ChangeDetailParam = z.infer<typeof changeDetailParamSchema>;
export type ChangeDetailQuery = z.infer<typeof changeDetailQuerySchema>;
export type ChangeDetailResponse = z.infer<typeof changeDetailResponseSchema>;
export type LastUpdateResponse = z.infer<typeof lastUpdateResponseSchema>;
