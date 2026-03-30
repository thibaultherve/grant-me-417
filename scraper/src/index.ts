import { Command } from 'commander';
import { createHash } from 'crypto';
import 'dotenv/config';
import {
  VISA_CONFIGS,
  type EligibilityFlags,
  type VisaType,
} from './config.js';
import { sendNotification, type ScrapeResult } from './notify.js';
import { extractEligibilityFromHtml } from './parser.js';
import { disconnectPrisma, getPrismaClient } from './prisma.js';
import { fetchPage, withRetry } from './scraper.js';
import { generateSeedData } from './seed-generator.js';
import {
  atomicUpdate,
  getCurrentEligibility,
  getLastEffectiveDate,
  loadBasePostcodesByState,
  saveFailedRun,
} from './staging.js';
import { validateScrapedData } from './validator.js';
import {
  closeSharedBrowser,
  createRateLimiter,
  fetchSnapshotSmart,
  listSnapshots,
  timestampToDate,
  tryParseSnapshot,
} from './wayback.js';

/** Quick hash of scraped data to detect identical postcodes+flags across snapshots. */
function hashScrapedData(data: Map<string, EligibilityFlags>): string {
  const sorted = [...data.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(
      ([k, v]) =>
        `${k}:${+v.is_remote_very_remote}${+v.is_northern_australia}${+v.is_regional_australia}${+v.is_bushfire_declared}${+v.is_natural_disaster_declared}`,
    )
    .join('|');
  return createHash('md5').update(sorted).digest('hex');
}

/**
 * Hardcoded set of Wayback timestamps known to be skippable (SKIPPED or DATA UNCHANGED).
 * Generated from a previous dry-run. Add timestamps here after running with --build-skiplist.
 */
const SKIP_TIMESTAMPS_417 = new Set<string>([
  '20190122090904',
  '20190215050627',
  '20190324091925',
  '20190325150740',
  '20190329121720',
  '20190405215144',
  '20190604173749',
  '20190627014242',
  '20190723085250',
  '20190918111106',
  '20190927100518',
  '20191002191156',
  '20191118053938',
  '20191228000848',
  '20191229105259',
  '20200103172224',
  '20200107185454',
  '20200212083917',
  '20200227041546',
  '20200319024031',
  '20200330002647',
  '20200330002656',
  '20200520214642',
  '20200616190121',
  '20200702110851',
  '20200807030142',
  '20200914194423',
  '20201016054358', // INCOMPATIBLE HTML - page doesn't load
  '20201017103119',
  '20201018194834',
  '20201020012727',
  '20201020113736',
  '20201022141819',
  '20201025100256',
  '20201027040150',
  '20201028001435',
  '20201029065044',
  '20201030075059',
  '20201031103436',
  '20201106201847',
  '20201112012721',
  '20201118093439',
  '20201119105625',
  '20201125051316',
  '20201213203008',
  '20201218173430',
  '20210224100252', // INCOMPATIBLE HTML
  '20210301122158',
  '20210305141325',
  '20210305141337',
  '20210305150324',
  '20210311212053',
  '20210410211215',
  '20210506210026',
  '20210620100236',
  '20210724130341',
  '20210817214230',
  '20210818075255',
  '20211026104733',
  '20211028105636',
  '20220120053702',
  '20220120053738',
  '20220120062306',
  '20220120063830',
  '20220128004853',
  '20220131093353',
  '20220228222728',
  '20220304215508',
  '20220304215535',
  '20220326083418',
  '20220509045456',
  '20220512233810',
  '20220515121535',
  '20220517021549',
  '20220527013244',
  '20220529011924',
  '20220622233147',
  '20220710234932',
  '20220712090208',
  '20221002053635',
  '20221018051909',
  '20221021095659',
  '20221026024931',
  '20221127161203',
  '20221127161212',
  '20221220070137',
  '20221221154845',
  '20230109063302',
  '20230109201518',
  '20230110214627',
  '20230111222227',
  '20230112223800',
  '20230113225439',
  '20230113235921',
  '20230114211048',
  '20230116162517',
  '20230118183240',
  '20230131045653',
  '20230202061230',
  '20230203074009',
  '20230204081236',
  '20230205090459',
  '20230208092953',
  '20230209035246',
  '20230210030658',
  '20230216150527',
  '20230217155837',
  '20230221121821',
  '20230222090726',
  '20230223123158',
  '20230224115420',
  '20230225113902',
  '20230226111613',
  '20230227115734',
  '20230228063845',
  '20230228144731',
  '20230228213807',
  '20230301212937',
  '20230302215600',
  '20230326205045',
  '20230330072048',
  '20230501193626',
  '20230606014620',
  '20230606145530',
  '20230627073219',
  '20230806114048',
  '20230929155555',
  '20231017221541',
  '20231024223840',
  '20240118141305',
  '20240124182207',
  '20240125115453',
  '20240226195019',
  '20240301232153',
  '20240305043436',
  '20241001092728',
  '20241006215618',
  '20241015203649',
  '20241103071734',
  '20241213171839',
  '20250111112523',
  '20250114214359',
  '20250116174818',
  '20250122232111',
  '20250215054228',
  '20250227143031',
  '20250307235022',
  '20250315002717',
  '20250414183109',
  '20250423071432',
  '20250614225949',
  '20250617122818',
  '20250718093644',
  '20250719071259',
  '20250724214300',
  '20250824014351',
  '20250906150755',
  '20251002060826',
  '20251114075400',
  '20251205231448',
  '20260111120336',
  '20260111194437',
]);

const SKIP_TIMESTAMPS_462 = new Set<string>([
  '20190324091446',
  '20190325150915',
  '20190329121309',
  '20190627011724',
  '20190723093938',
  '20190918115549',
  '20190927095928',
  '20191002190757',
  '20191122210957',
  '20191228000336',
]);

const SKIP_TIMESTAMPS: Record<string, Set<string>> = {
  '417': SKIP_TIMESTAMPS_417,
  '462': SKIP_TIMESTAMPS_462,
};

const program = new Command();

program
  .name('@regranted/scraper')
  .description('Postcode eligibility scraper for Australian WHV visas')
  .version('1.0.0');

program
  .command('start')
  .description('Scrape postcode eligibility data for a visa type')
  .requiredOption('--visa <type>', 'Visa type: 417 or 462')
  .action(async (options: { visa: string }) => {
    const visaType = options.visa as VisaType;

    if (!(visaType in VISA_CONFIGS)) {
      console.error(`Invalid visa type: ${visaType}. Must be 417 or 462.`);
      process.exit(1);
    }

    const config = VISA_CONFIGS[visaType];
    const startTime = Date.now();
    const prisma = getPrismaClient();

    try {
      console.log(`Starting scrape for ${config.name}...`);
      console.log(`URL: ${config.url}`);

      // 1. Fetch page with retry
      console.log('Fetching page...');
      const { html, pageModifiedDate } = await withRetry(() =>
        fetchPage(config.url),
      );
      console.log(
        `Page fetched. Modified date: ${pageModifiedDate ?? 'not found'}`,
      );

      // 2. Check if page has changed since last scrape
      if (pageModifiedDate) {
        const lastDate = await getLastEffectiveDate(prisma, visaType);
        if (lastDate === pageModifiedDate) {
          console.log(
            `No changes detected (page modified: ${pageModifiedDate}, last scrape: ${lastDate})`,
          );

          const result: ScrapeResult = {
            visaType,
            visaName: config.name,
            status: 'no_changes',
            totalPostcodes: 0,
            changesDetected: 0,
            postcodesAffected: 0,
            pageModifiedDate,
            durationMs: Date.now() - startTime,
          };

          // Save a scrape run with 0 changes
          await prisma.scrapeRun.create({
            data: {
              visaType,
              totalPostcodes: 0,
              changesDetected: 0,
              postcodesAffected: 0,
              status: 'success',
              notes: 'No changes - page not modified since last scrape',
              pageModifiedDate: new Date(pageModifiedDate),
              sourceUrl: config.url,
              sourceType: 'live',
            },
          });

          await sendNotification(result);
          return;
        }
      }

      // 3. Load base postcodes for "All postcodes" expansion
      const basePostcodesByState = await loadBasePostcodesByState(prisma);

      // 4. Parse HTML to extract eligibility data
      console.log('Parsing HTML...');
      const scrapedData = extractEligibilityFromHtml(
        html,
        basePostcodesByState,
      );
      console.log(`Parsed ${scrapedData.size} postcodes`);

      // 5. Validate scraped data
      console.log('Validating...');
      const currentFromDb = await getCurrentEligibility(prisma, visaType);
      const validation = validateScrapedData(scrapedData, currentFromDb);

      if (validation.warnings.length > 0) {
        for (const warning of validation.warnings) {
          console.warn(`Warning: ${warning}`);
        }
      }

      if (!validation.isValid) {
        const errorMsg = validation.errors.join('; ');
        console.error(`Validation failed: ${errorMsg}`);

        await saveFailedRun(prisma, visaType, errorMsg, config.url);

        const result: ScrapeResult = {
          visaType,
          visaName: config.name,
          status: 'failed',
          totalPostcodes: scrapedData.size,
          changesDetected: 0,
          postcodesAffected: 0,
          pageModifiedDate,
          durationMs: Date.now() - startTime,
          error: errorMsg,
        };
        await sendNotification(result);
        process.exit(1);
      }

      // 6. Atomic update (staging -> compare -> history -> swap)
      console.log('Performing atomic update...');
      const effectiveDate =
        pageModifiedDate ?? new Date().toISOString().split('T')[0];
      const updateResult = await atomicUpdate(
        prisma,
        visaType,
        scrapedData,
        effectiveDate,
        config.url,
        'live',
        scrapedData.size,
      );

      console.log(
        `Update complete: ${updateResult.changesDetected} changes, ${updateResult.postcodesAffected} postcodes affected`,
      );

      // 7. Send Discord notification
      const result: ScrapeResult = {
        visaType,
        visaName: config.name,
        status: updateResult.changesDetected > 0 ? 'success' : 'no_changes',
        totalPostcodes: scrapedData.size,
        changesDetected: updateResult.changesDetected,
        postcodesAffected: updateResult.postcodesAffected,
        pageModifiedDate,
        durationMs: Date.now() - startTime,
      };
      await sendNotification(result);

      // 8. Generate seed data if changes detected
      if (updateResult.changesDetected > 0) {
        console.log('Changes detected, regenerating seed data...');
        await generateSeedData();
      }

      console.log(
        `Scrape completed in ${Math.round((Date.now() - startTime) / 1000)}s`,
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`Scrape failed: ${errorMsg}`);

      try {
        await saveFailedRun(prisma, visaType, errorMsg, config.url);
        await sendNotification({
          visaType,
          visaName: config.name,
          status: 'failed',
          totalPostcodes: 0,
          changesDetected: 0,
          postcodesAffected: 0,
          pageModifiedDate: null,
          durationMs: Date.now() - startTime,
          error: errorMsg,
        });
      } catch (notifyError) {
        console.error('Failed to save error run or notify:', notifyError);
      }

      process.exit(1);
    } finally {
      await disconnectPrisma();
    }
  });

program
  .command('backfill')
  .description('Backfill historical eligibility data from Wayback Machine')
  .requiredOption('--visa <type>', 'Visa type: 417 or 462')
  .option('--from <date>', 'Start date (YYYYMMDD)', '20170101')
  .option('--to <date>', 'End date (YYYYMMDD)')
  .option('--dry-run', 'Parse snapshots without writing to DB')
  .option('--limit <n>', 'Max snapshots to process')
  .action(
    async (options: {
      visa: string;
      from: string;
      to?: string;
      dryRun?: boolean;
      limit?: string;
    }) => {
      const visaType = options.visa as VisaType;

      if (!(visaType in VISA_CONFIGS)) {
        console.error(`Invalid visa type: ${visaType}. Must be 417 or 462.`);
        process.exit(1);
      }

      const config = VISA_CONFIGS[visaType];
      const prisma = getPrismaClient();
      const rateLimit = createRateLimiter(500); // 2 req/s (lightweight date-only fetches)

      try {
        // 1. List available snapshots from CDX API
        console.log(`Listing Wayback snapshots for ${config.name}...`);
        let snapshots = await listSnapshots(config.url, {
          from: options.from,
          to: options.to,
        });

        if (snapshots.length === 0) {
          console.log('No snapshots found.');
          return;
        }

        const maxSnapshots = options.limit
          ? parseInt(options.limit, 10)
          : snapshots.length;
        snapshots = snapshots.slice(0, maxSnapshots);
        console.log(
          `Found ${snapshots.length} unique snapshots to process (oldest → newest)`,
        );

        if (options.dryRun) {
          console.log('DRY RUN - will parse but not write to DB\n');
        }

        // 2. Load base postcodes for "All postcodes" expansion
        const tBase = Date.now();
        const basePostcodesByState = await loadBasePostcodesByState(prisma);
        console.log(`  [init] loadBasePostcodes=${Date.now() - tBase}ms`);

        let processed = 0;
        let skipped = 0;
        let hardSkips = 0;
        let dataUnchanged = 0;
        let totalChanges = 0;
        let lastEffectiveDate: string | null = null;
        let lastDataHash: string | null = null;
        const skipTimestamps: string[] = []; // collect skippable timestamps for --build-skiplist

        const skipSet = SKIP_TIMESTAMPS[visaType];
        if (skipSet?.size) {
          console.log(
            `  [skiplist] ${skipSet.size} hardcoded timestamps to skip`,
          );
        }

        // 3. Process each snapshot oldest -> newest
        for (let i = 0; i < snapshots.length; i++) {
          const snapshot = snapshots[i];
          const snapshotDate = timestampToDate(snapshot.timestamp);
          const progress = `[${i + 1}/${snapshots.length}]`;

          // Hardcoded skip — no fetch needed
          if (skipSet?.has(snapshot.timestamp)) {
            console.log(`${progress} ${snapshotDate} - HARD SKIP`);
            hardSkips++;
            skipped++;
            continue;
          }

          await rateLimit();

          // Single-pass: load page, check date, if changed wait for tables
          let smartResult;
          try {
            smartResult = await fetchSnapshotSmart(
              snapshot,
              snapshotDate,
              lastEffectiveDate,
            );
          } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            console.warn(`${progress} ${snapshotDate} - FETCH FAILED: ${msg}`);
            skipped++;
            continue;
          }

          if (smartResult.kind === 'skipped') {
            console.log(
              `${progress} ${snapshotDate} - SKIPPED (pageModified=${smartResult.pageModifiedDate ?? 'null'}, effective=${smartResult.effectiveDate})`,
            );
            skipTimestamps.push(snapshot.timestamp);
            skipped++;
            continue;
          }

          lastEffectiveDate = smartResult.effectiveDate;
          const { fetchResult } = smartResult;

          // Try to parse - if structure is incompatible, skip gracefully
          const scrapedData = tryParseSnapshot(
            fetchResult.html,
            basePostcodesByState,
          );
          if (!scrapedData) {
            console.warn(
              `${progress} ${snapshotDate} - INCOMPATIBLE HTML structure, skipping`,
            );
            skipTimestamps.push(snapshot.timestamp);
            skipped++;
            continue;
          }

          // Check if actual data changed (not just the modified date)
          const dataHash = hashScrapedData(scrapedData);
          if (dataHash === lastDataHash) {
            console.log(
              `${progress} ${snapshotDate} - DATA UNCHANGED (${scrapedData.size} postcodes, pageModified=${fetchResult.pageModifiedDate ?? 'null'}, effective=${smartResult.effectiveDate})`,
            );
            skipTimestamps.push(snapshot.timestamp);
            dataUnchanged++;
            skipped++;
            continue;
          }
          lastDataHash = dataHash;

          if (options.dryRun) {
            console.log(
              `${progress} ${snapshotDate} - OK: ${scrapedData.size} postcodes, pageModified=${fetchResult.pageModifiedDate ?? 'null'}, effective=${smartResult.effectiveDate}`,
            );
            processed++;
            continue;
          }

          // Validate (relaxed for historical data - skip drop check since DB may be empty)
          if (scrapedData.size < 50) {
            console.warn(
              `${progress} ${snapshotDate} - Only ${scrapedData.size} postcodes, skipping`,
            );
            skipped++;
            continue;
          }

          // Atomic update with wayback source type
          try {
            const updateResult = await atomicUpdate(
              prisma,
              visaType,
              scrapedData,
              smartResult.effectiveDate,
              fetchResult.waybackUrl,
              'wayback',
              scrapedData.size,
            );

            totalChanges += updateResult.changesDetected;
            console.log(
              `${progress} ${snapshotDate} - ${updateResult.changesDetected} changes, ${updateResult.postcodesAffected} postcodes affected`,
            );
          } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            console.warn(`${progress} ${snapshotDate} - DB ERROR: ${msg}`);
            skipped++;
          }

          processed++;
        }

        // Output skippable timestamps for hardcoding
        if (skipTimestamps.length > 0) {
          console.log(`\n--- Copy these into SKIP_TIMESTAMPS_${visaType} ---`);
          console.log(skipTimestamps.map((t) => `  '${t}',`).join('\n'));
          console.log('---');
        }

        console.log(
          `\nBackfill complete: ${processed} processed, ${skipped} skipped (${hardSkips} hard, ${dataUnchanged} data unchanged), ${totalChanges} total changes`,
        );
      } catch (error) {
        console.error('Backfill failed:', error);
        process.exit(1);
      } finally {
        await closeSharedBrowser();
        await disconnectPrisma();
      }
    },
  );

program
  .command('seed')
  .description('Generate seed-data.json from current database state')
  .action(async () => {
    try {
      await generateSeedData();
    } catch (error) {
      console.error('Seed generation failed:', error);
      process.exit(1);
    }
  });

program.parseAsync();
