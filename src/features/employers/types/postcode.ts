export interface Postcode {
  postcode: string;
  is_remote_very_remote: boolean;
  is_northern_australia: boolean;
  is_regional_australia: boolean;
  is_bushfire_declared: boolean;
  is_natural_disaster_declared: boolean;
  last_updated: string;
  last_scraped: string | null;
}

export interface PostcodeBadge {
  type: 'remote' | 'northern' | 'regional' | 'bushfire' | 'disaster';
  label: string;
  active: boolean;
}
