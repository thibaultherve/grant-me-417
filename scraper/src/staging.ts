import type { EligibilityFlags } from './config';
import {
  type ChangeEntry,
  buildHistoryRecords,
  countAffectedPostcodes,
} from './history;';
import type { PrismaClient } from './prisma';

export interface AtomicUpdateResult {
  changesDetected: number;
  postcodesAffected: number;
  scrapeRunId: string;
}

/**
 * Perform an atomic update of postcode eligibility data using a staging table.
 *
 * Steps:
 * 1. Create temp staging table
 * 2. Insert scraped data into staging
 * 3. Detect changes (staging vs production)
 * 4. Record history entries for each flag change
 * 5. Update production table from staging
 * 6. Save scrape_run record
 *
 * All within a single transaction - if anything fails, production is untouched.
 */
export async function atomicUpdate(
  prisma: PrismaClient,
  visaType: string,
  scrapedData: Map<string, EligibilityFlags>,
  effectiveDate: string,
  sourceUrl: string,
  sourceType: string = 'live',
  totalPostcodes: number,
): Promise<AtomicUpdateResult> {
  // We need to use raw SQL for the staging table pattern since Prisma
  // doesn't support temp tables natively. Use $transaction with raw queries.
  return await prisma.$transaction(
    async (tx) => {
      // 1. Create temp staging table
      await tx.$executeRawUnsafe(`
      CREATE TEMP TABLE pe_staging (
        postcode VARCHAR(4) NOT NULL,
        is_remote_very_remote BOOLEAN NOT NULL DEFAULT false,
        is_northern_australia BOOLEAN NOT NULL DEFAULT false,
        is_regional_australia BOOLEAN NOT NULL DEFAULT false,
        is_bushfire_declared BOOLEAN NOT NULL DEFAULT false,
        is_natural_disaster_declared BOOLEAN NOT NULL DEFAULT false
      ) ON COMMIT DROP
    `);

      // 2. Insert scraped data into staging (batch for performance)
      const entries = [...scrapedData.entries()];
      const batchSize = 500;

      for (let i = 0; i < entries.length; i += batchSize) {
        const batch = entries.slice(i, i + batchSize);
        const values = batch
          .map(
            ([postcode, flags]) =>
              `('${postcode}', ${flags.is_remote_very_remote}, ${flags.is_northern_australia}, ${flags.is_regional_australia}, ${flags.is_bushfire_declared}, ${flags.is_natural_disaster_declared})`,
          )
          .join(',\n');

        await tx.$executeRawUnsafe(`
        INSERT INTO pe_staging (postcode, is_remote_very_remote, is_northern_australia, is_regional_australia, is_bushfire_declared, is_natural_disaster_declared)
        VALUES ${values}
      `);
      }

      // 3. Detect changes (staging vs production)
      const changes = await tx.$queryRaw<
        Array<{
          postcode: string;
          new_remote: boolean;
          old_remote: boolean;
          new_northern: boolean;
          old_northern: boolean;
          new_regional: boolean;
          old_regional: boolean;
          new_bushfire: boolean;
          old_bushfire: boolean;
          new_disaster: boolean;
          old_disaster: boolean;
        }>
      >`
      SELECT s.postcode,
             s.is_remote_very_remote AS new_remote, p.is_remote_very_remote AS old_remote,
             s.is_northern_australia AS new_northern, p.is_northern_australia AS old_northern,
             s.is_regional_australia AS new_regional, p.is_regional_australia AS old_regional,
             s.is_bushfire_declared AS new_bushfire, p.is_bushfire_declared AS old_bushfire,
             s.is_natural_disaster_declared AS new_disaster, p.is_natural_disaster_declared AS old_disaster
      FROM pe_staging s
      JOIN postcode_eligibility p ON s.postcode = p.postcode AND p.visa_type = ${visaType}
      WHERE s.is_remote_very_remote != p.is_remote_very_remote
         OR s.is_northern_australia != p.is_northern_australia
         OR s.is_regional_australia != p.is_regional_australia
         OR s.is_bushfire_declared != p.is_bushfire_declared
         OR s.is_natural_disaster_declared != p.is_natural_disaster_declared
    `;

      // Convert raw changes to ChangeEntry format
      const changeEntries: ChangeEntry[] = [];
      for (const row of changes) {
        if (row.old_remote !== row.new_remote) {
          changeEntries.push({
            postcode: row.postcode,
            category: 'is_remote_very_remote',
            oldValue: row.old_remote,
            newValue: row.new_remote,
          });
        }
        if (row.old_northern !== row.new_northern) {
          changeEntries.push({
            postcode: row.postcode,
            category: 'is_northern_australia',
            oldValue: row.old_northern,
            newValue: row.new_northern,
          });
        }
        if (row.old_regional !== row.new_regional) {
          changeEntries.push({
            postcode: row.postcode,
            category: 'is_regional_australia',
            oldValue: row.old_regional,
            newValue: row.new_regional,
          });
        }
        if (row.old_bushfire !== row.new_bushfire) {
          changeEntries.push({
            postcode: row.postcode,
            category: 'is_bushfire_declared',
            oldValue: row.old_bushfire,
            newValue: row.new_bushfire,
          });
        }
        if (row.old_disaster !== row.new_disaster) {
          changeEntries.push({
            postcode: row.postcode,
            category: 'is_natural_disaster_declared',
            oldValue: row.old_disaster,
            newValue: row.new_disaster,
          });
        }
      }

      // 4. Create scrape_run record first (history entries reference it)
      const scrapeRun = await tx.scrapeRun.create({
        data: {
          visaType,
          totalPostcodes,
          changesDetected: changeEntries.length,
          postcodesAffected: countAffectedPostcodes(changeEntries),
          status: 'success',
          pageModifiedDate: new Date(effectiveDate),
          sourceUrl,
          sourceType,
        },
      });

      // 5. Record history entries for each change (batched for performance)
      if (changeEntries.length > 0) {
        const historyRecords = buildHistoryRecords(
          changeEntries,
          visaType,
          effectiveDate,
          sourceUrl,
          sourceType,
        );

        const histBatchSize = 200;
        for (let i = 0; i < historyRecords.length; i += histBatchSize) {
          const batch = historyRecords.slice(i, i + histBatchSize);
          const values = batch
            .map(
              (r) =>
                `('${r.postcode}', '${r.visaType}', '${r.category}', ${r.oldValue}, ${r.newValue}, '${r.effectiveDate}'::date, NOW(), '${scrapeRun.id}'::uuid, '${r.sourceUrl}', '${r.sourceType}')`,
            )
            .join(',\n');

          await tx.$executeRawUnsafe(`
          INSERT INTO postcode_eligibility_history (postcode, visa_type, category, old_value, new_value, effective_date, detected_at, scrape_run_id, source_url, source_type)
          VALUES ${values}
        `);
        }
      }

      // 6. Update production table from staging
      await tx.$executeRaw`
      UPDATE postcode_eligibility p SET
        is_remote_very_remote = s.is_remote_very_remote,
        is_northern_australia = s.is_northern_australia,
        is_regional_australia = s.is_regional_australia,
        is_bushfire_declared = s.is_bushfire_declared,
        is_natural_disaster_declared = s.is_natural_disaster_declared,
        last_scraped = NOW()
      FROM pe_staging s
      WHERE p.postcode = s.postcode AND p.visa_type = ${visaType}
    `;

      // 7. Insert new postcodes that exist in staging but not in production
      await tx.$executeRaw`
      INSERT INTO postcode_eligibility (postcode, visa_type, is_remote_very_remote, is_northern_australia, is_regional_australia, is_bushfire_declared, is_natural_disaster_declared, last_scraped)
      SELECT s.postcode, ${visaType}, s.is_remote_very_remote, s.is_northern_australia, s.is_regional_australia, s.is_bushfire_declared, s.is_natural_disaster_declared, NOW()
      FROM pe_staging s
      LEFT JOIN postcode_eligibility p ON s.postcode = p.postcode AND p.visa_type = ${visaType}
      WHERE p.postcode IS NULL
        AND EXISTS (SELECT 1 FROM postcodes pc WHERE pc.postcode = s.postcode)
    `;

      return {
        changesDetected: changeEntries.length,
        postcodesAffected: countAffectedPostcodes(changeEntries),
        scrapeRunId: scrapeRun.id,
      };
    },
    { timeout: 60_000 },
  );
}

/**
 * Save a failed scrape run to the database (outside of staging transaction).
 */
export async function saveFailedRun(
  prisma: PrismaClient,
  visaType: string,
  error: string,
  sourceUrl: string,
  sourceType: string = 'live',
): Promise<void> {
  await prisma.scrapeRun.create({
    data: {
      visaType,
      totalPostcodes: 0,
      changesDetected: 0,
      postcodesAffected: 0,
      status: 'failed',
      notes: error,
      sourceUrl,
      sourceType,
    },
  });
}

/**
 * Get the last successful scrape run's effective date for a visa type.
 * Used to check if the page has been modified since last scrape.
 */
export async function getLastEffectiveDate(
  prisma: PrismaClient,
  visaType: string,
): Promise<string | null> {
  const lastRun = await prisma.scrapeRun.findFirst({
    where: {
      visaType,
      status: 'success',
      pageModifiedDate: { not: null },
    },
    orderBy: { runAt: 'desc' },
    select: { pageModifiedDate: true },
  });

  if (!lastRun?.pageModifiedDate) return null;
  return lastRun.pageModifiedDate.toISOString().split('T')[0];
}

/**
 * Get current eligibility data from the database for comparison.
 */
export async function getCurrentEligibility(
  prisma: PrismaClient,
  visaType: string,
): Promise<
  Array<{
    postcode: string;
    is_remote_very_remote: boolean;
    is_northern_australia: boolean;
    is_regional_australia: boolean;
    is_bushfire_declared: boolean;
    is_natural_disaster_declared: boolean;
  }>
> {
  const rows = await prisma.postcodeEligibility.findMany({
    where: { visaType },
    select: {
      postcode: true,
      isRemoteVeryRemote: true,
      isNorthernAustralia: true,
      isRegionalAustralia: true,
      isBushfireDeclared: true,
      isNaturalDisasterDeclared: true,
    },
  });

  return rows.map((r) => ({
    postcode: r.postcode,
    is_remote_very_remote: r.isRemoteVeryRemote,
    is_northern_australia: r.isNorthernAustralia,
    is_regional_australia: r.isRegionalAustralia,
    is_bushfire_declared: r.isBushfireDeclared,
    is_natural_disaster_declared: r.isNaturalDisasterDeclared,
  }));
}

/**
 * Load base postcodes grouped by state code (for "All postcodes" expansion).
 */
export async function loadBasePostcodesByState(
  prisma: PrismaClient,
): Promise<Map<string, string[]>> {
  const suburbs = await prisma.suburb.findMany({
    select: { postcode: true, stateCode: true },
    distinct: ['postcode'],
  });

  const byState = new Map<string, string[]>();
  for (const suburb of suburbs) {
    const existing = byState.get(suburb.stateCode) ?? [];
    existing.push(suburb.postcode);
    byState.set(suburb.stateCode, existing);
  }

  return byState;
}
