import type { Browser, BrowserContext } from 'playwright';
import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { extractPageModifiedDate } from './parser';

// Register stealth plugin to bypass Akamai bot detection
chromium.use(StealthPlugin());

export interface FetchResult {
  html: string;
  pageModifiedDate: string | null;
}

/**
 * Fetch a government page using Playwright headless Chromium with stealth.
 * Uses playwright-extra + stealth plugin to bypass Akamai CDN bot detection.
 */
export async function fetchPage(url: string): Promise<FetchResult> {
  let browser: Browser | null = null;
  let context: BrowserContext | null = null;

  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--disable-blink-features=AutomationControlled'],
    });
    context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
    });

    const page = await context.newPage();

    // Block non-essential resources for speed (keep CSS - needed for layout)
    await page.route(
      '**/*.{png,jpg,jpeg,gif,webp,svg,woff,woff2,ico}',
      (route) => route.abort(),
    );

    // Navigate - use 'load' to ensure JS-rendered content is available
    await page.goto(url, { waitUntil: 'load', timeout: 60_000 });

    // Wait for the specific element we need (tables with captions)
    // Government site can be slow to render JS-generated tables
    await page.locator('table caption').first().waitFor({ timeout: 45_000 });

    const html = await page.content();
    const pageModifiedDate = extractPageModifiedDate(html);

    return { html, pageModifiedDate };
  } finally {
    if (context) await context.close();
    if (browser) await browser.close();
  }
}

/**
 * Retry wrapper with exponential backoff + jitter.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options = { maxAttempts: 3, baseDelayMs: 2000 },
): Promise<T> {
  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === options.maxAttempts) throw error;
      if (!isTransientError(error)) throw error;

      const delay = options.baseDelayMs * Math.pow(2, attempt - 1);
      const jitter = Math.random() * delay * 0.5;
      console.log(
        `Attempt ${attempt} failed, retrying in ${Math.round(delay + jitter)}ms...`,
      );
      await new Promise((r) => setTimeout(r, delay + jitter));
    }
  }
  throw new Error('Unreachable');
}

function isTransientError(error: unknown): boolean {
  if (error instanceof Error) {
    if (error.message.includes('timeout')) return true;
    if (error.message.includes('net::ERR_')) return true;
    if (error.message.includes('Access Denied')) return true;
    if ('status' in error) {
      const status = (error as Error & { status: number }).status;
      return status === 429 || status >= 500;
    }
  }
  return false;
}
