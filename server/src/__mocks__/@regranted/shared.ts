/**
 * Manual Jest mock for @regranted/shared.
 *
 * Jest auto-resolves this file when any test calls:
 *   jest.mock('@regranted/shared')
 *
 * Keep ZONE_FLAG_MAP in sync with shared/src/constants/visa-rules.ts.
 */

export const ZONE_FLAG_MAP = {
  northern: 'isNorthernAustralia',
  remote: 'isRemoteVeryRemote',
  regional: 'isRegionalAustralia',
  bushfire: 'isBushfireDeclared',
  weather: 'isNaturalDisasterDeclared',
  anywhere: null,
};

// Zod schemas — replaced with plain objects since tests mock services
export const toggleFavoritePostcodeSchema = {};
export const postcodeDirectoryQuerySchema = {
  pick: jest.fn().mockReturnValue({}),
};
export const paginatedDirectoryQuerySchema = {};
export const globalChangesQuerySchema = {};
export const postcodeParamSchema = {};
export const searchQuerySchema = {};
export const suburbIdParamSchema = {};
