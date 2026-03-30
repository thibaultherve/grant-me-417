import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPrismaClient, disconnectPrisma } from './prisma.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

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

/**
 * Generate seed-data.json from current database state.
 * The seed file uses the 417 visa eligibility data as the base.
 */
export async function generateSeedData(): Promise<void> {
  const prisma = getPrismaClient();

  try {
    console.log('Generating seed data from database...');

    // Fetch all postcodes
    const postcodes = await prisma.postcode.findMany({
      orderBy: { postcode: 'asc' },
    });

    // Fetch 417 eligibility (used as base for seed)
    const eligibility = await prisma.postcodeEligibility.findMany({
      where: { visaType: '417' },
    });
    const eligibilityMap = new Map(eligibility.map((e) => [e.postcode, e]));

    // Fetch all suburbs
    const suburbs = await prisma.suburb.findMany({
      orderBy: [{ postcode: 'asc' }, { suburbName: 'asc' }],
    });

    // Build seed data
    const seedData: SeedData = {
      postcodes: postcodes.map((pc) => {
        const elig = eligibilityMap.get(pc.postcode);
        return {
          postcode: pc.postcode,
          is_remote_very_remote: elig?.isRemoteVeryRemote ?? false,
          is_northern_australia: elig?.isNorthernAustralia ?? false,
          is_regional_australia: elig?.isRegionalAustralia ?? false,
          is_bushfire_declared: elig?.isBushfireDeclared ?? false,
          is_natural_disaster_declared: elig?.isNaturalDisasterDeclared ?? false,
          last_updated: pc.lastUpdated?.toISOString() ?? new Date().toISOString(),
          last_scraped: elig?.lastScraped?.toISOString() ?? new Date().toISOString(),
        };
      }),
      suburbs: suburbs.map((sb) => ({
        id: sb.id,
        suburb_name: sb.suburbName,
        postcode: sb.postcode,
        state_code: sb.stateCode,
      })),
    };

    const outputPath = join(__dirname, '..', '..', 'server', 'prisma', 'seed-data.json');
    writeFileSync(outputPath, JSON.stringify(seedData, null, 2));

    console.log(
      `Seed data written to ${outputPath}: ${seedData.postcodes.length} postcodes, ${seedData.suburbs.length} suburbs`,
    );
  } finally {
    await disconnectPrisma();
  }
}

// Allow direct execution
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  generateSeedData().catch((error) => {
    console.error('Seed generation failed:', error);
    process.exit(1);
  });
}
