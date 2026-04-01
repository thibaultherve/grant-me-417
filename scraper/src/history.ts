import { CATEGORIES, type Category, type EligibilityFlags } from './config';

export interface ChangeEntry {
  postcode: string;
  category: Category;
  oldValue: boolean;
  newValue: boolean;
}

export interface HistoryRecord {
  postcode: string;
  visaType: string;
  category: Category;
  oldValue: boolean;
  newValue: boolean;
  effectiveDate: string;
  sourceUrl: string;
  sourceType: string;
}

/**
 * Diff two sets of eligibility flags for a single postcode.
 * Returns an array of ChangeEntry for each flag that changed.
 */
export function diffFlags(
  postcode: string,
  oldFlags: EligibilityFlags,
  newFlags: EligibilityFlags,
): ChangeEntry[] {
  const changes: ChangeEntry[] = [];

  for (const category of CATEGORIES) {
    if (oldFlags[category] !== newFlags[category]) {
      changes.push({
        postcode,
        category,
        oldValue: oldFlags[category],
        newValue: newFlags[category],
      });
    }
  }

  return changes;
}

/**
 * Build history records from a list of changes, ready for database insertion.
 */
export function buildHistoryRecords(
  changes: ChangeEntry[],
  visaType: string,
  effectiveDate: string,
  sourceUrl: string,
  sourceType: string = 'live',
): HistoryRecord[] {
  return changes.map((change) => ({
    postcode: change.postcode,
    visaType,
    category: change.category,
    oldValue: change.oldValue,
    newValue: change.newValue,
    effectiveDate,
    sourceUrl,
    sourceType,
  }));
}

/**
 * Count unique postcodes affected by changes.
 */
export function countAffectedPostcodes(changes: ChangeEntry[]): number {
  return new Set(changes.map((c) => c.postcode)).size;
}
