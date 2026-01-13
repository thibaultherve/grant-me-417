import type { Postcode } from './postcode';

export interface Suburb {
  id: number;
  suburb_name: string;
  postcode: string;
  state_code: string;
}

// Subset of Postcode fields needed for badge display
export type PostcodeBadgeData = Pick<
  Postcode,
  | 'is_regional_australia'
  | 'is_remote_very_remote'
  | 'is_northern_australia'
  | 'is_bushfire_declared'
  | 'is_natural_disaster_declared'
>;

export interface SuburbWithPostcode extends Suburb {
  postcodeData?: PostcodeBadgeData | null;
}
