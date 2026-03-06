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

interface SeedData {
  postcodes: PostcodeRow[];
  suburbs: SuburbRow[];
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
    await client.query('DELETE FROM suburbs');
    await client.query('DELETE FROM postcodes');

    // Insert postcodes in batches of 500
    const PC_BATCH = 500;
    for (let i = 0; i < data.postcodes.length; i += PC_BATCH) {
      const batch = data.postcodes.slice(i, i + PC_BATCH);
      const values: unknown[] = [];
      const placeholders = batch
        .map((pc, idx) => {
          const offset = idx * 8;
          values.push(
            pc.postcode,
            pc.is_remote_very_remote,
            pc.is_northern_australia,
            pc.is_regional_australia,
            pc.is_bushfire_declared,
            pc.is_natural_disaster_declared,
            pc.last_updated,
            pc.last_scraped,
          );
          return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}::timestamptz, $${offset + 8}::timestamptz)`;
        })
        .join(', ');

      await client.query(
        `INSERT INTO postcodes (postcode, is_remote_very_remote, is_northern_australia, is_regional_australia, is_bushfire_declared, is_natural_disaster_declared, last_updated, last_scraped)
         VALUES ${placeholders}
         ON CONFLICT (postcode) DO NOTHING`,
        values,
      );
    }
    console.log(`  ✓ ${data.postcodes.length} postcodes inserted`);

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
