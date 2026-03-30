import { chromium, type Browser, type BrowserContext } from 'playwright';
import { extractPageModifiedDate, extractEligibilityFromHtml } from './parser.js';

export interface WaybackSnapshot {
  timestamp: string; // "20200315120000"
  url: string; // original URL
  statusCode: string;
  digest: string;
}

export interface WaybackFetchResult {
  html: string;
  pageModifiedDate: string | null;
  snapshot: WaybackSnapshot;
  waybackUrl: string;
}

/**
 * Query the Wayback Machine CDX API to list available snapshots for a URL.
 * Returns snapshots sorted oldest -> newest (required for correct diff calculation).
 */
export async function listSnapshots(
  originalUrl: string,
  options: { from?: string; to?: string } = {},
): Promise<WaybackSnapshot[]> {
  const cdxUrl = new URL('https://web.archive.org/cdx/search/cdx');
  cdxUrl.searchParams.set('url', originalUrl);
  cdxUrl.searchParams.set('output', 'json');
  cdxUrl.searchParams.set('filter', 'statuscode:200');
  cdxUrl.searchParams.set('collapse', 'digest');

  if (options.from) cdxUrl.searchParams.set('from', options.from);
  if (options.to) cdxUrl.searchParams.set('to', options.to);

  console.log(`Querying CDX API: ${cdxUrl.toString()}`);
  const t0 = Date.now();

  const response = await fetch(cdxUrl.toString(), {
    headers: { 'Accept-Encoding': 'gzip, deflate, br' },
  });
  if (!response.ok) {
    throw new Error(`CDX API error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as string[][];
  console.log(`  [cdx] fetch+parse=${Date.now() - t0}ms, rows=${data.length - 1}`);
  if (data.length < 2) return [];

  const [_header, ...rows] = data;

  return rows.map((row) => ({
    timestamp: row[1],
    url: row[2],
    statusCode: row[4],
    digest: row[5],
  }));
}

// --- Shared browser ---

let sharedBrowser: Browser | null = null;
let sharedContext: BrowserContext | null = null;

async function getSharedBrowser(): Promise<BrowserContext> {
  if (!sharedContext || !sharedBrowser) {
    sharedBrowser = await chromium.launch({
      headless: true,
      args: ['--disable-blink-features=AutomationControlled'],
    });
    sharedContext = await sharedBrowser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
    });
  }
  return sharedContext;
}

export async function closeSharedBrowser(): Promise<void> {
  if (sharedContext) {
    await sharedContext.close();
    sharedContext = null;
  }
  if (sharedBrowser) {
    await sharedBrowser.close();
    sharedBrowser = null;
  }
}

// --- Single-pass smart fetch ---

export type SmartFetchResult =
  | { kind: 'skipped'; pageModifiedDate: string | null; effectiveDate: string }
  | { kind: 'fetched'; fetchResult: WaybackFetchResult; effectiveDate: string };

/**
 * Single-pass fetch: loads the page once, checks the date, and if it changed
 * continues to wait for tables. Avoids double page loads.
 */
export async function fetchSnapshotSmart(
  snapshot: WaybackSnapshot,
  snapshotDate: string,
  lastEffectiveDate: string | null,
): Promise<SmartFetchResult> {
  const waybackUrl = `https://web.archive.org/web/${snapshot.timestamp}/${snapshot.url}`;
  const t0 = Date.now();

  const context = await getSharedBrowser();
  const page = await context.newPage();
  const tPage = Date.now();

  try {
    await page.goto(waybackUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    const tGoto = Date.now();

    // Phase 1: wait for date span to be populated by JS
    let dateFound = false;
    try {
      // Match "15 November 2018" or "15/11/2018 11:28"
      await page.locator('span#pageModified').filter({ hasText: /\d{1,2}[\s/]\w+[\s/]\d{4}/ }).waitFor({ timeout: 8_000 });
      dateFound = true;
    } catch {
      // Date span not found
    }
    const tDate = Date.now();

    const dateHtml = await page.content();
    const pageModifiedDate = extractPageModifiedDate(dateHtml);
    const effectiveDate = pageModifiedDate ?? snapshotDate;

    // Early exit if date hasn't changed
    if (effectiveDate === lastEffectiveDate) {
      console.log(
        `  [smart] newPage=${tPage - t0}ms goto=${tGoto - tPage}ms waitDate=${tDate - tGoto}ms${dateFound ? '' : '(miss)'} → SKIP total=${Date.now() - t0}ms`,
      );
      return { kind: 'skipped', pageModifiedDate, effectiveDate };
    }

    // Phase 2: date changed — wait for tables to render
    try {
      await page.locator('table caption, table th').first().waitFor({ timeout: 30_000 });
    } catch {
      // No tables found
    }
    const tTable = Date.now();

    // Wait for row count to stabilize instead of fixed 3s sleep
    let lastRowCount = 0;
    for (let i = 0; i < 6; i++) {
      await page.waitForTimeout(500);
      const rowCount = await page.locator('table tbody tr').count();
      if (rowCount > 0 && rowCount === lastRowCount) break;
      lastRowCount = rowCount;
    }
    const tStable = Date.now();

    const html = await page.content();
    const tParse = Date.now();

    console.log(
      `  [smart] newPage=${tPage - t0}ms goto=${tGoto - tPage}ms waitDate=${tDate - tGoto}ms${dateFound ? '' : '(miss)'} waitTable=${tTable - tDate}ms stabilize=${tStable - tTable}ms parse=${tParse - tStable}ms → FETCH total=${tParse - t0}ms`,
    );

    return {
      kind: 'fetched',
      effectiveDate,
      fetchResult: { html, pageModifiedDate, snapshot, waybackUrl },
    };
  } finally {
    await page.close();
  }
}

// --- Legacy functions (kept for non-backfill commands) ---

/**
 * Fetch a single Wayback Machine snapshot using Playwright (full wait).
 */
export async function fetchSnapshot(snapshot: WaybackSnapshot): Promise<WaybackFetchResult> {
  const waybackUrl = `https://web.archive.org/web/${snapshot.timestamp}/${snapshot.url}`;

  const context = await getSharedBrowser();
  const page = await context.newPage();

  try {
    await page.goto(waybackUrl, { waitUntil: 'load', timeout: 60_000 });

    try {
      await page.locator('table caption, table th').first().waitFor({ timeout: 30_000 });
    } catch {
      // No tables found
    }

    // Wait for row count to stabilize
    let lastRowCount = 0;
    for (let i = 0; i < 6; i++) {
      await page.waitForTimeout(500);
      const rowCount = await page.locator('table tbody tr').count();
      if (rowCount > 0 && rowCount === lastRowCount) break;
      lastRowCount = rowCount;
    }

    const html = await page.content();
    const pageModifiedDate = extractPageModifiedDate(html);

    return { html, pageModifiedDate, snapshot, waybackUrl };
  } finally {
    await page.close();
  }
}

/**
 * Try to parse a Wayback snapshot. Returns null if the HTML structure is incompatible.
 */
export function tryParseSnapshot(
  html: string,
  basePostcodesByState: Map<string, string[]>,
): Map<string, import('./config.js').EligibilityFlags> | null {
  try {
    const result = extractEligibilityFromHtml(html, basePostcodesByState);
    if (result.size === 0) return null;
    return result;
  } catch {
    return null;
  }
}

/**
 * Rate limiter: ensures minimum delay between calls.
 */
export function createRateLimiter(minDelayMs: number = 1250) {
  let lastCallTime = 0;

  return async function rateLimit(): Promise<void> {
    const now = Date.now();
    const elapsed = now - lastCallTime;
    if (elapsed < minDelayMs) {
      await new Promise((r) => setTimeout(r, minDelayMs - elapsed));
    }
    lastCallTime = Date.now();
  };
}

/**
 * Convert a Wayback timestamp "20200315120000" to a date "2020-03-15".
 */
export function timestampToDate(timestamp: string): string {
  const year = timestamp.slice(0, 4);
  const month = timestamp.slice(4, 6);
  const day = timestamp.slice(6, 8);
  return `${year}-${month}-${day}`;
}
