import type { VisaSubclass } from '../types';
import type { IndustryTypeValue } from './industries';

export const ZONE_TYPES = [
  'northern',
  'remote',
  'regional',
  'bushfire',
  'weather',
  'anywhere',
] as const;
export type ZoneType = (typeof ZONE_TYPES)[number];

/**
 * Maps each zone to the corresponding PostcodeBadgeData flag.
 * `null` means the zone is always active (e.g. "anywhere in Australia").
 */
export const ZONE_FLAG_MAP: Record<ZoneType, string | null> = {
  northern: 'isNorthernAustralia',
  remote: 'isRemoteVeryRemote',
  regional: 'isRegionalAustralia',
  bushfire: 'isBushfireDeclared',
  weather: 'isNaturalDisasterDeclared',
  anywhere: null,
};

type IndustryZoneMap = Record<IndustryTypeValue, ZoneType[]>;

/**
 * Eligible zones per industry per visa type.
 * Source: https://immi.homeaffairs.gov.au (417 + 462 specified work pages)
 */
export const ELIGIBLE_ZONES: Record<VisaSubclass, IndustryZoneMap> = {
  '417': {
    hospitality_and_tourism: ['northern', 'remote'],
    plant_and_animal_cultivation: ['regional'],
    fishing_and_pearling: ['regional'],
    tree_farming_and_felling: ['regional'],
    mining: ['regional'],
    construction: ['regional'],
    bushfire_recovery_work: ['bushfire'],
    weather_recovery_work: ['weather'],
    critical_covid19_work: ['anywhere'],
    other: [],
  },
  '462': {
    hospitality_and_tourism: ['northern', 'remote'],
    plant_and_animal_cultivation: ['northern', 'regional'],
    fishing_and_pearling: ['northern'],
    tree_farming_and_felling: ['northern'],
    mining: [],
    construction: ['northern', 'regional'],
    bushfire_recovery_work: ['bushfire'],
    weather_recovery_work: ['weather'],
    critical_covid19_work: ['anywhere'],
    other: [],
  },
};
