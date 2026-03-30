/* eslint-disable @typescript-eslint/no-require-imports */
import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const pg = require('pg') as typeof import('pg');

interface PostcodeRow {
  postcode: string;
  is_remote_very_remote: boolean;
  is_northern_australia: boolean;
  is_regional_australia: boolean;
  is_bushfire_declared: boolean;
  is_natural_disaster_declared: boolean;
  last_updated: string;
  last_scraped: string;
}

interface SuburbRow {
  id: number;
  suburb_name: string;
  postcode: string;
  state_code: string;
}

interface ScrapeRunRow {
  id: string;
  run_at: string | null;
  visa_type: string | null;
  total_postcodes: number | null;
  changes_detected: number | null;
  postcodes_affected: number | null;
  status: string | null;
  notes: string | null;
  page_modified_date: string | null;
  source_url: string | null;
  source_type: string;
}

interface HistoryRow {
  id: string;
  postcode: string;
  visa_type: string;
  category: string;
  old_value: boolean;
  new_value: boolean;
  effective_date: string;
  detected_at: string;
  scrape_run_id: string | null;
  source_url: string;
  source_type: string;
}

interface SeedData {
  postcodes: PostcodeRow[];
  suburbs: SuburbRow[];
  scrapeRuns?: ScrapeRunRow[];
  history?: HistoryRow[];
}

async function main() {
  const dataPath = join(__dirname, 'seed-data.json');
  const raw = readFileSync(dataPath, 'utf-8');
  const data = JSON.parse(raw) as SeedData;

  console.log(
    `Seeding ${data.postcodes.length} postcodes and ${data.suburbs.length} suburbs...`,
  );

  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    await client.query('BEGIN');

    // Clear existing reference data (order matters for FK constraints)
    await client.query('DELETE FROM postcode_eligibility_history');
    await client.query('DELETE FROM scrape_runs');
    await client.query('DELETE FROM postcode_eligibility');
    await client.query('DELETE FROM suburbs');
    await client.query('DELETE FROM postcodes');

    // Insert postcodes in batches of 500 (pure reference, no flags)
    const PC_BATCH = 500;
    for (let i = 0; i < data.postcodes.length; i += PC_BATCH) {
      const batch = data.postcodes.slice(i, i + PC_BATCH);
      const values: unknown[] = [];
      const placeholders = batch
        .map((pc, idx) => {
          const offset = idx * 2;
          values.push(pc.postcode, pc.last_updated);
          return `($${offset + 1}, $${offset + 2}::timestamptz)`;
        })
        .join(', ');

      await client.query(
        `INSERT INTO postcodes (postcode, last_updated)
         VALUES ${placeholders}
         ON CONFLICT (postcode) DO NOTHING`,
        values,
      );
    }
    console.log(`  ✓ ${data.postcodes.length} postcodes inserted`);

    // Insert postcode_eligibility for visa 417 (from seed data flags)
    const EL_BATCH = 500;
    for (let i = 0; i < data.postcodes.length; i += EL_BATCH) {
      const batch = data.postcodes.slice(i, i + EL_BATCH);
      const values: unknown[] = [];
      const placeholders = batch
        .map((pc, idx) => {
          const offset = idx * 7;
          values.push(
            pc.postcode,
            pc.is_remote_very_remote,
            pc.is_northern_australia,
            pc.is_regional_australia,
            pc.is_bushfire_declared,
            pc.is_natural_disaster_declared,
            pc.last_scraped,
          );
          return `($${offset + 1}, '417', $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}::timestamptz)`;
        })
        .join(', ');

      await client.query(
        `INSERT INTO postcode_eligibility (postcode, visa_type, is_remote_very_remote, is_northern_australia, is_regional_australia, is_bushfire_declared, is_natural_disaster_declared, last_scraped)
         VALUES ${placeholders}
         ON CONFLICT (postcode, visa_type) DO NOTHING`,
        values,
      );
    }
    console.log(`  ✓ ${data.postcodes.length} eligibility rows (417) inserted`);

    // Insert empty 462 eligibility rows
    for (let i = 0; i < data.postcodes.length; i += EL_BATCH) {
      const batch = data.postcodes.slice(i, i + EL_BATCH);
      const values: unknown[] = [];
      const placeholders = batch
        .map((pc, idx) => {
          values.push(pc.postcode);
          return `($${idx + 1}, '462')`;
        })
        .join(', ');

      await client.query(
        `INSERT INTO postcode_eligibility (postcode, visa_type)
         VALUES ${placeholders}
         ON CONFLICT (postcode, visa_type) DO NOTHING`,
        values,
      );
    }
    console.log(`  ✓ ${data.postcodes.length} eligibility rows (462) inserted`);

    // Insert suburbs in batches of 500
    const SB_BATCH = 500;
    for (let i = 0; i < data.suburbs.length; i += SB_BATCH) {
      const batch = data.suburbs.slice(i, i + SB_BATCH);
      const values: unknown[] = [];
      const placeholders = batch
        .map((sb, idx) => {
          const offset = idx * 4;
          values.push(sb.id, sb.suburb_name, sb.postcode, sb.state_code);
          return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4})`;
        })
        .join(', ');

      await client.query(
        `INSERT INTO suburbs (id, suburb_name, postcode, state_code)
         VALUES ${placeholders}
         ON CONFLICT (id) DO NOTHING`,
        values,
      );
    }
    console.log(`  ✓ ${data.suburbs.length} suburbs inserted`);

    // Reset suburb ID sequence to max + 1
    await client.query(
      `SELECT setval('suburbs_id_seq', (SELECT COALESCE(MAX(id), 0) FROM suburbs))`,
    );

    // Insert scrape runs (must come before history due to FK)
    const scrapeRuns = data.scrapeRuns ?? [];
    const SR_BATCH = 500;
    for (let i = 0; i < scrapeRuns.length; i += SR_BATCH) {
      const batch = scrapeRuns.slice(i, i + SR_BATCH);
      const values: unknown[] = [];
      const placeholders = batch
        .map((sr, idx) => {
          const offset = idx * 11;
          values.push(
            sr.id,
            sr.run_at,
            sr.visa_type,
            sr.total_postcodes,
            sr.changes_detected,
            sr.postcodes_affected,
            sr.status,
            sr.notes,
            sr.page_modified_date,
            sr.source_url,
            sr.source_type,
          );
          return `($${offset + 1}::uuid, $${offset + 2}::timestamptz, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}::date, $${offset + 10}, $${offset + 11})`;
        })
        .join(', ');

      await client.query(
        `INSERT INTO scrape_runs (id, run_at, visa_type, total_postcodes, changes_detected, postcodes_affected, status, notes, page_modified_date, source_url, source_type)
         VALUES ${placeholders}
         ON CONFLICT (id) DO NOTHING`,
        values,
      );
    }
    if (scrapeRuns.length > 0) {
      console.log(`  ✓ ${scrapeRuns.length} scrape runs inserted`);
    }

    // Insert eligibility history
    const history = data.history ?? [];
    const HI_BATCH = 500;
    for (let i = 0; i < history.length; i += HI_BATCH) {
      const batch = history.slice(i, i + HI_BATCH);
      const values: unknown[] = [];
      const placeholders = batch
        .map((h, idx) => {
          const offset = idx * 11;
          values.push(
            h.id,
            h.postcode,
            h.visa_type,
            h.category,
            h.old_value,
            h.new_value,
            h.effective_date,
            h.detected_at,
            h.scrape_run_id,
            h.source_url,
            h.source_type,
          );
          return `($${offset + 1}::uuid, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}::date, $${offset + 8}::timestamptz, $${offset + 9}::uuid, $${offset + 10}, $${offset + 11})`;
        })
        .join(', ');

      await client.query(
        `INSERT INTO postcode_eligibility_history (id, postcode, visa_type, category, old_value, new_value, effective_date, detected_at, scrape_run_id, source_url, source_type)
         VALUES ${placeholders}
         ON CONFLICT (id) DO NOTHING`,
        values,
      );
    }
    if (history.length > 0) {
      console.log(`  ✓ ${history.length} history entries inserted`);
    }

    await client.query('COMMIT');
    console.log('Seed completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seed failed, rolled back:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
