-- work_entries: hours must be between 0 and 24
ALTER TABLE work_entries ADD CONSTRAINT chk_work_entries_hours
  CHECK (hours >= 0 AND hours <= 24);

-- user_visas: visa_type must be valid enum
ALTER TABLE user_visas ADD CONSTRAINT chk_user_visas_visa_type
  CHECK (visa_type IN ('first_whv', 'second_whv', 'third_whv'));

-- visa_weekly_progress: eligible_days must match WHV thresholds
ALTER TABLE visa_weekly_progress ADD CONSTRAINT chk_weekly_progress_eligible_days
  CHECK (eligible_days IN (0, 1, 2, 3, 4, 7));

-- postcodes: must be 4 digits
ALTER TABLE postcodes ADD CONSTRAINT chk_postcodes_format
  CHECK (postcode ~ '^\d{4}$');
