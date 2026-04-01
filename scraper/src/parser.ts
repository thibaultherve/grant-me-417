import type { Cheerio, CheerioAPI } from 'cheerio';
import * as cheerio from 'cheerio';
import {
  emptyFlags,
  resolveStateCode,
  type Category,
  type EligibilityFlags,
} from './config;';

// Cheerio 1.2 doesn't export Element/AnyNode directly.
// Infer the node type from what CheerioAPI returns.
type CheerioNode = ReturnType<CheerioAPI> extends Cheerio<infer N> ? N : never;

/**
 * Identify which eligibility category a table caption refers to.
 */
export function identifyCategory(text: string): Category | null {
  const lower = text.toLowerCase();
  if (lower.includes('remote and very remote')) return 'is_remote_very_remote';
  if (lower.includes('northern australia')) return 'is_northern_australia';
  if (lower.includes('regional australia')) return 'is_regional_australia';
  if (lower.includes('bushfire')) return 'is_bushfire_declared';
  if (lower.includes('natural disaster')) return 'is_natural_disaster_declared';
  // Legacy format variants (pre-2025 Wayback snapshots)
  if (lower.includes('flood affected')) return 'is_natural_disaster_declared';
  return null;
}

/**
 * Parse a postcode string from the government page into an array of 4-digit postcode strings.
 *
 * Handles:
 * - Single: "2356" -> ["2356"]
 * - Comma-separated: "2356, 2386" -> ["2356", "2386"]
 * - Ranges: "2832 to 2836" -> ["2832", "2833", "2834", "2835", "2836"]
 * - "All postcodes" -> expand using base postcodes for that state
 */
export function parsePostcodeString(
  postcodeText: string,
  stateName: string,
  basePostcodesByState: Map<string, string[]>,
): string[] {
  // Strip zero-width spaces and other invisible Unicode chars
  let text = postcodeText.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();

  // "not classified" / "is not" → this row should produce no postcodes
  if (
    text.toLowerCase().includes('not classified') ||
    text.toLowerCase().includes('is not')
  ) {
    return [];
  }

  // "All of X is classified as part of..." / "All postcodes" / "Entire Territory"
  const allKeywords = [
    'all postcodes',
    'all areas',
    'all postcode',
    'entire territory',
    'all of ',
  ];
  if (allKeywords.some((kw) => text.toLowerCase().includes(kw))) {
    return expandAllPostcodes(stateName, basePostcodesByState);
  }

  // Strip "Note: ..." suffixes (informational, exclusions already reflected in ranges)
  text = text.replace(/\bNote:.*$/is, '').trim();

  const postcodes: string[] = [];
  const parts = text.split(',');

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    if (trimmed.includes(' to ')) {
      const rangeParts = trimmed.split(' to ');
      if (rangeParts.length === 2) {
        const start = parseInt(rangeParts[0].trim(), 10);
        const end = parseInt(rangeParts[1].trim(), 10);
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = start; i <= end; i++) {
            postcodes.push(String(i).padStart(4, '0'));
          }
        }
      }
    } else {
      const code = parseInt(trimmed, 10);
      if (!isNaN(code)) {
        postcodes.push(String(code).padStart(4, '0'));
      }
      // Non-numeric text after stripping "Note:" is silently ignored
      // (e.g. leftover city names from partial note stripping)
    }
  }

  return [...new Set(postcodes)].sort();
}

/**
 * Expand "All postcodes" for a given state using base postcode data.
 */
function expandAllPostcodes(
  stateName: string,
  basePostcodesByState: Map<string, string[]>,
): string[] {
  const stateCode = resolveStateCode(stateName);
  if (!stateCode) {
    console.warn(
      `Warning: Unknown state name '${stateName}', cannot expand "All postcodes"`,
    );
    return [];
  }

  const postcodes = basePostcodesByState.get(stateCode);
  if (!postcodes || postcodes.length === 0) {
    // Hardcoded fallback for Norfolk Island (only 1 postcode, often missing from DB)
    if (stateCode === 'NI') return ['2899'];
    console.warn(`Warning: No base postcodes found for state '${stateCode}'`);
    return [];
  }

  return [...postcodes].sort();
}

/**
 * Extract the pageModified date from the HTML.
 * Returns ISO date string (YYYY-MM-DD) or null if not found.
 */
export function extractPageModifiedDate(html: string): string | null {
  const $ = cheerio.load(html);
  const modifiedSpan = $('span#pageModified');

  if (modifiedSpan.length === 0) return null;

  const dateText = modifiedSpan.text().trim();
  return parseDateString(dateText);
}

/**
 * Parse a date string to "YYYY-MM-DD".
 * Supports: "11 September 2025", "15/11/2018 11:28", "15/11/2018"
 */
function parseDateString(dateText: string): string | null {
  const months: Record<string, string> = {
    january: '01',
    february: '02',
    march: '03',
    april: '04',
    may: '05',
    june: '06',
    july: '07',
    august: '08',
    september: '09',
    october: '10',
    november: '11',
    december: '12',
  };

  // Format: "11 September 2025"
  const textMatch = dateText.match(/^(\d{1,2})\s+(\w+)\s+(\d{4})$/);
  if (textMatch) {
    const [, day, monthName, year] = textMatch;
    const month = months[monthName.toLowerCase()];
    if (month) return `${year}-${month}-${day.padStart(2, '0')}`;
  }

  // Format: "15/11/2018" or "15/11/2018 11:28"
  const slashMatch = dateText.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (slashMatch) {
    const [, day, month, year] = slashMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  return null;
}

/**
 * Parse all HTML tables from the government page and extract postcode eligibility data.
 * Supports two formats:
 * - Modern (2025+): tables have `<caption>` identifying the zone
 * - Legacy (pre-2025): tables have no caption, zone is identified by a preceding `<h2>`/`<h3>` heading
 *
 * Returns a Map of postcode -> EligibilityFlags.
 */
export function extractEligibilityFromHtml(
  html: string,
  basePostcodesByState: Map<string, string[]>,
): Map<string, EligibilityFlags> {
  const $ = cheerio.load(html);
  const result = new Map<string, EligibilityFlags>();
  const tables = $('table');

  // Detect format: if any table has a caption matching our categories, use modern parser
  let hasCaptions = false;
  tables.each((_i, table) => {
    const captionText = $(table).find('caption').text().trim();
    if (captionText && identifyCategory(captionText)) hasCaptions = true;
  });

  if (hasCaptions) {
    parseModernFormat($, tables, basePostcodesByState, result);
  } else {
    parseLegacyFormat($, tables, basePostcodesByState, result);
  }

  return result;
}

/**
 * Modern format (2025+): each table has a `<caption>` identifying the zone.
 */
function parseModernFormat(
  $: CheerioAPI,
  tables: Cheerio<CheerioNode>,
  basePostcodesByState: Map<string, string[]>,
  result: Map<string, EligibilityFlags>,
): void {
  tables.each((_i, table) => {
    const caption = $(table).find('caption');
    if (caption.length === 0) return;

    const captionText = caption.text().trim();
    const category = identifyCategory(captionText);
    if (!category) return;

    extractPostcodesFromTable($, table, category, basePostcodesByState, result);
  });
}

/**
 * Legacy format (pre-2025): tables have no caption.
 * Strategy: collect all headings and tables in document order,
 * then assign each table to the closest preceding heading that matches a category.
 */
function parseLegacyFormat(
  $: CheerioAPI,
  tables: Cheerio<CheerioNode>,
  basePostcodesByState: Map<string, string[]>,
  result: Map<string, EligibilityFlags>,
): void {
  // Build a map of table element -> category by scanning all h2/h3/h4 and tables in document order
  const tableCategories = buildTableCategoryMap($);

  tables.each((_i, table) => {
    const category = tableCategories.get(table);
    if (!category) return;

    extractPostcodesFromTable($, table, category, basePostcodesByState, result);
  });
}

/**
 * Scan all headings, paragraphs, and tables in document order.
 * For each table, assign the most recent text element that matches a category.
 *
 * Includes `<p>` because older 462 pages use paragraph text (not headings)
 * to introduce each category section between tables.
 */
function buildTableCategoryMap($: CheerioAPI): Map<CheerioNode, Category> {
  const map = new Map<CheerioNode, Category>();
  let currentCategory: Category | null = null;

  $('h2, h3, h4, p, table').each((_i, el) => {
    const tagName = el.type === 'tag' ? el.tagName?.toLowerCase() : '';

    if (
      tagName === 'h2' ||
      tagName === 'h3' ||
      tagName === 'h4' ||
      tagName === 'p'
    ) {
      const text = $(el).text().trim();
      const category = identifyCategory(text);
      if (category) {
        currentCategory = category;
      }
    } else if (tagName === 'table' && currentCategory) {
      map.set(el, currentCategory);
    }
  });

  return map;
}

/**
 * Extract postcodes from a table's rows and apply the given category flag.
 * Handles both formats: <tbody><tr><td> and direct <tr><td>.
 */
function extractPostcodesFromTable(
  $: CheerioAPI,
  table: CheerioNode,
  category: Category,
  basePostcodesByState: Map<string, string[]>,
  result: Map<string, EligibilityFlags>,
): void {
  const rows =
    $(table).find('tbody tr').length > 0
      ? $(table).find('tbody tr')
      : $(table).find('tr');

  rows.each((_j, row) => {
    const cells = $(row).find('td');
    if (cells.length < 2) return;

    const stateName = cells.eq(0).text().trim();
    const postcodesText = cells.eq(1).text().trim();

    // Skip header-like rows or empty rows
    if (!postcodesText || stateName.toLowerCase().includes('state')) return;

    // parsePostcodeString handles all edge cases:
    // "not classified" → [], "All of X" → expanded, "Note: ..." → stripped
    const postcodes = parsePostcodeString(
      postcodesText,
      stateName,
      basePostcodesByState,
    );
    for (const postcode of postcodes) {
      if (!result.has(postcode)) result.set(postcode, emptyFlags());
      result.get(postcode)![category] = true;
    }
  });
}
