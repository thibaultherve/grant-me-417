import { postcodeEligibilitySchema } from '@regranted/shared';
import { CATEGORIES, CATEGORY_LABELS, type EligibilityFlags } from './config';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface DbEligibilityRow {
  postcode: string;
  is_remote_very_remote: boolean;
  is_northern_australia: boolean;
  is_regional_australia: boolean;
  is_bushfire_declared: boolean;
  is_natural_disaster_declared: boolean;
}

/**
 * Validate scraped data before writing to staging table.
 *
 * Rules:
 * 1. Total postcodes count must be > 100 (expect ~2500)
 * 2. All 5 categories must have >= 1 postcode
 * 3. No category loses > 20% of its postcodes vs current DB
 * 4. Circuit breaker: > 50% Zod validation failures = page structure changed
 */
export function validateScrapedData(
  scraped: Map<string, EligibilityFlags>,
  currentFromDb: DbEligibilityRow[],
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Rule 1: Minimum postcodes count
  if (scraped.size < 100) {
    errors.push(
      `Only ${scraped.size} postcodes found (expected ~2500). Page structure may have changed.`,
    );
  }

  // Rule 2: All 5 categories must have >= 1 postcode
  for (const category of CATEGORIES) {
    const count = [...scraped.values()].filter((f) => f[category]).length;
    if (count === 0) {
      warnings.push(`${CATEGORY_LABELS[category]}: no postcodes found`);
    }
  }

  // Rule 3: No category drops > 20%
  for (const category of CATEGORIES) {
    const currentCount = currentFromDb.filter((p) => p[category]).length;
    const scrapedCount = [...scraped.values()].filter(
      (f) => f[category],
    ).length;
    if (currentCount > 0) {
      const dropPercent = ((currentCount - scrapedCount) / currentCount) * 100;
      if (dropPercent > 20) {
        errors.push(
          `${CATEGORY_LABELS[category]}: dropped ${dropPercent.toFixed(0)}% (${currentCount} -> ${scrapedCount})`,
        );
      }
    }
  }

  // Rule 4 (circuit breaker): Validate each record with Zod
  let zodFailures = 0;
  for (const [postcode, flags] of scraped) {
    const result = postcodeEligibilitySchema.safeParse({
      postcode,
      visaType: '417', // dummy for validation shape
      isRemoteVeryRemote: flags.is_remote_very_remote,
      isNorthernAustralia: flags.is_northern_australia,
      isRegionalAustralia: flags.is_regional_australia,
      isBushfireDeclared: flags.is_bushfire_declared,
      isNaturalDisasterDeclared: flags.is_natural_disaster_declared,
    });
    if (!result.success) zodFailures++;
  }
  if (scraped.size > 0 && zodFailures / scraped.size > 0.5) {
    errors.push(
      `Circuit breaker: ${zodFailures}/${scraped.size} records failed Zod validation. Page structure changed.`,
    );
  }

  return { isValid: errors.length === 0, errors, warnings };
}
