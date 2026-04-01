import type {
  Postcode as PostcodeResponse,
  PostcodeBadgeData,
  PostcodeHistoryEntry,
  SuburbWithPostcode,
  PaginatedDirectoryQuery,
  PaginatedDirectoryResponse,
  PostcodeDetailResponse,
  GlobalChangesResponse,
  ChangeDetailResponse,
  LastUpdateResponse,
} from '@regranted/shared';
import { ZONE_FLAG_MAP } from '@regranted/shared';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import type {
  Postcode as PostcodeRecord,
  Prisma,
} from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { formatDate } from '../common/utils/format';

const SUBURB_INCLUDE = {
  postcodeRef: {
    include: {
      eligibility: true,
    },
  },
} as const;

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/** Reverse map from snake_case DB column name → zone name, derived from ZONE_FLAG_MAP */
const DB_CATEGORY_TO_ZONE: Record<string, string> = Object.fromEntries(
  Object.entries(ZONE_FLAG_MAP)
    .filter((e): e is [string, string] => e[1] !== null)
    .map(([zone, flag]) => [
      flag.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`),
      zone,
    ]),
);

type SuburbWithPostcodeRecord = Prisma.SuburbGetPayload<{
  include: typeof SUBURB_INCLUDE;
}>;

@Injectable()
export class PostcodesService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async searchPostcodes(query: string, limit = 5): Promise<PostcodeResponse[]> {
    if (query.length < 2) return [];

    const cacheKey = `postcodes:${query}:${limit}`;
    const cached = await this.cacheManager.get<PostcodeResponse[]>(cacheKey);
    if (cached) return cached;

    const postcodes = await this.prisma.postcode.findMany({
      where: {
        postcode: { startsWith: query },
      },
      take: limit,
      orderBy: { postcode: 'asc' },
    });

    const result = postcodes.map((p) => this.mapPostcodeToResponse(p));
    await this.cacheManager.set(cacheKey, result, CACHE_TTL_MS);
    return result;
  }

  async searchSuburbs(
    query: string,
    limit = 10,
  ): Promise<SuburbWithPostcode[]> {
    if (query.length < 2) return [];

    const cacheKey = `suburbs:${query}:${limit}`;
    const cached = await this.cacheManager.get<SuburbWithPostcode[]>(cacheKey);
    if (cached) return cached;

    const isNumeric = /^\d+$/.test(query);

    const suburbs = await this.prisma.suburb.findMany({
      where: isNumeric
        ? { postcode: { startsWith: query } }
        : { suburbName: { startsWith: query, mode: 'insensitive' } },
      include: SUBURB_INCLUDE,
      take: limit,
      orderBy: isNumeric ? { postcode: 'asc' } : { suburbName: 'asc' },
    });

    const result = suburbs.map((s) => this.mapSuburbToResponse(s));
    await this.cacheManager.set(cacheKey, result, CACHE_TTL_MS);
    return result;
  }

  async getSuburbById(id: number): Promise<SuburbWithPostcode | null> {
    const suburb = await this.prisma.suburb.findUnique({
      where: { id },
      include: SUBURB_INCLUDE,
    });

    if (!suburb) return null;

    return this.mapSuburbToResponse(suburb);
  }

  async getPostcodeHistory(
    postcode: string,
    visaType: string,
  ): Promise<PostcodeHistoryEntry[]> {
    const history = await this.prisma.postcodeEligibilityHistory.findMany({
      where: { postcode, visaType },
      orderBy: { effectiveDate: 'asc' },
    });

    return history.map((h) => ({
      effectiveDate: formatDate(h.effectiveDate),
      category: h.category,
      action: h.newValue ? ('ENTERED' as const) : ('LEFT' as const),
      sourceType: h.sourceType,
    }));
  }

  // ── Paginated Directory ────────────────────────────────────────────────────

  async getPaginatedDirectory(
    params: PaginatedDirectoryQuery,
    userId: string,
  ): Promise<PaginatedDirectoryResponse> {
    const { visaType, page, limit, search, states, zones, favorites, sort } =
      params;

    const conditions: Prisma.PostcodeWhereInput[] = [];

    // Only show postcodes that have eligibility for this visa type
    if (zones?.length) {
      const zoneFlags = zones
        .map((z) => ZONE_FLAG_MAP[z])
        .filter((f): f is string => f !== null);
      if (zoneFlags.length > 0) {
        conditions.push({
          eligibility: {
            some: {
              visaType,
              OR: zoneFlags.map((flag) => ({ [flag]: true })),
            },
          },
        });
      } else {
        // Only 'anywhere' zones selected — match all postcodes with eligibility
        conditions.push({ eligibility: { some: { visaType } } });
      }
    } else {
      conditions.push({ eligibility: { some: { visaType } } });
    }

    // State filter
    if (states?.length) {
      conditions.push({
        suburbs: { some: { stateCode: { in: states } } },
      });
    }

    // Search filter
    if (search) {
      const isNumeric = /^\d+$/.test(search);
      if (isNumeric) {
        conditions.push({ postcode: { startsWith: search } });
      } else {
        conditions.push({
          suburbs: {
            some: { suburbName: { contains: search, mode: 'insensitive' } },
          },
        });
      }
    }

    // Favorites filter
    if (favorites) {
      conditions.push({ favoritedBy: { some: { userId } } });
    }

    const where: Prisma.PostcodeWhereInput =
      conditions.length > 1 ? { AND: conditions } : (conditions[0] ?? {});

    const [total, postcodes] = await Promise.all([
      this.prisma.postcode.count({ where }),
      this.prisma.postcode.findMany({
        where,
        include: {
          suburbs: {
            take: 3,
            orderBy: { suburbName: 'asc' },
            select: { suburbName: true, stateCode: true },
          },
          eligibility: {
            where: { visaType },
            take: 1,
          },
          favoritedBy: {
            where: { userId },
            take: 1,
            select: { userId: true },
          },
        },
        orderBy: { postcode: sort },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data: postcodes.map((p) => {
        const elig = p.eligibility[0];
        return {
          postcode: p.postcode,
          stateCode: p.suburbs[0]?.stateCode ?? '',
          zones: elig ? this.getActiveZones(elig) : [],
          suburbs: p.suburbs.map((s) => s.suburbName),
          isFavorite: p.favoritedBy.length > 0,
        };
      }),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ── Postcode Detail ───────────────────────────────────────────────────────

  async getPostcodeDetail(postcode: string): Promise<PostcodeDetailResponse> {
    const cacheKey = `postcode-detail:${postcode}`;
    const cached =
      await this.cacheManager.get<PostcodeDetailResponse>(cacheKey);
    if (cached) return cached;

    const result = await this.prisma.postcode.findUnique({
      where: { postcode },
      include: {
        suburbs: { orderBy: { suburbName: 'asc' } },
        eligibility: true,
        history: { orderBy: { effectiveDate: 'desc' } },
      },
    });

    if (!result) {
      throw new NotFoundException('Postcode not found');
    }

    const elig417 =
      result.eligibility.find((e) => e.visaType === '417') ?? null;
    const elig462 =
      result.eligibility.find((e) => e.visaType === '462') ?? null;

    const response: PostcodeDetailResponse = {
      postcode: result.postcode,
      lastUpdated: result.lastUpdated?.toISOString() ?? null,
      suburbs: result.suburbs.map((s) => ({
        id: s.id,
        suburbName: s.suburbName,
        postcode: s.postcode,
        stateCode: s.stateCode,
      })),
      eligibility417: elig417 ? this.pickBadgeFlags(elig417) : null,
      eligibility462: elig462 ? this.pickBadgeFlags(elig462) : null,
      history: result.history.map((h) => ({
        effectiveDate: formatDate(h.effectiveDate),
        category: h.category,
        action: h.newValue ? ('ENTERED' as const) : ('LEFT' as const),
        visaType: h.visaType as '417' | '462',
      })),
    };

    await this.cacheManager.set(cacheKey, response, CACHE_TTL_MS);
    return response;
  }

  // ── Global Changes (sidebar format — date-grouped with state counts) ────

  async getGlobalChanges(
    visaType: string,
    page: number,
    limit: number,
  ): Promise<GlobalChangesResponse> {
    // Step 1: Count distinct dates
    const countResult = await this.prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(DISTINCT effective_date) as count
      FROM postcode_eligibility_history
      WHERE visa_type = ${visaType}
    `;
    const total = Number(countResult[0].count);

    if (total === 0) {
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }

    // Step 2: Get paginated dates with zone/action/state counts
    const rows = await this.prisma.$queryRaw<
      Array<{
        effective_date: Date;
        category: string;
        new_value: boolean;
        state_code: string;
        postcode_count: bigint;
      }>
    >`
      WITH paginated_dates AS (
        SELECT DISTINCT effective_date
        FROM postcode_eligibility_history
        WHERE visa_type = ${visaType}
        ORDER BY effective_date DESC
        OFFSET ${(page - 1) * limit}
        LIMIT ${limit}
      )
      SELECT
        h.effective_date,
        h.category,
        h.new_value,
        COALESCE(
          (SELECT s.state_code FROM suburbs s WHERE s.postcode = h.postcode ORDER BY s.suburb_name LIMIT 1),
          ''
        ) as state_code,
        COUNT(DISTINCT h.postcode) as postcode_count
      FROM postcode_eligibility_history h
      JOIN paginated_dates pd ON pd.effective_date = h.effective_date
      WHERE h.visa_type = ${visaType}
      GROUP BY h.effective_date, h.category, h.new_value, state_code
      ORDER BY h.effective_date DESC, h.category, h.new_value DESC, state_code
    `;

    // Step 3: Group into date → changes → stateCounts
    const dateMap = new Map<
      string,
      {
        date: string;
        changes: Map<
          string,
          {
            zone: string;
            action: 'Added' | 'Deleted';
            stateCounts: Map<string, number>;
          }
        >;
      }
    >();

    for (const row of rows) {
      const dateKey = formatDate(row.effective_date);
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, { date: dateKey, changes: new Map() });
      }
      const dateEntry = dateMap.get(dateKey)!;

      const changeKey = `${row.category}|${row.new_value}`;
      if (!dateEntry.changes.has(changeKey)) {
        dateEntry.changes.set(changeKey, {
          zone: this.categoryToZoneName(row.category),
          action: row.new_value ? 'Added' : 'Deleted',
          stateCounts: new Map(),
        });
      }
      const changeEntry = dateEntry.changes.get(changeKey)!;

      const stateCode = row.state_code || '';
      const existing = changeEntry.stateCounts.get(stateCode) ?? 0;
      changeEntry.stateCounts.set(
        stateCode,
        existing + Number(row.postcode_count),
      );
    }

    // Step 4: Convert maps to arrays
    const data = Array.from(dateMap.values()).map((dateEntry) => ({
      date: dateEntry.date,
      changes: Array.from(dateEntry.changes.values()).map((change) => ({
        zone: change.zone,
        action: change.action,
        stateCounts: Array.from(change.stateCounts.entries()).map(
          ([stateCode, count]) => ({ stateCode, count }),
        ),
      })),
    }));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ── Change Detail (full postcodes for a specific date) ────────────────────

  async getChangeDetail(
    date: string,
    visaType: string,
  ): Promise<ChangeDetailResponse> {
    const rows = await this.prisma.$queryRaw<
      Array<{
        category: string;
        new_value: boolean;
        source_url: string | null;
        postcode: string;
        state_code: string;
      }>
    >`
      SELECT
        h.category,
        h.new_value,
        h.source_url,
        h.postcode,
        COALESCE(
          (SELECT s.state_code FROM suburbs s WHERE s.postcode = h.postcode ORDER BY s.suburb_name LIMIT 1),
          ''
        ) as state_code
      FROM postcode_eligibility_history h
      WHERE h.effective_date = ${new Date(date)}
        AND h.visa_type = ${visaType}
      ORDER BY h.category, h.new_value DESC, h.postcode
    `;

    if (rows.length === 0) {
      throw new NotFoundException(
        `No changes found for date ${date} and visa type ${visaType}`,
      );
    }

    // Group by zone+action
    const changeMap = new Map<
      string,
      {
        zone: string;
        action: 'Added' | 'Deleted';
        postcodes: Array<{ postcode: string; stateCode: string }>;
      }
    >();

    let sourceUrl: string | null = null;
    const uniquePostcodes = new Set<string>();

    for (const row of rows) {
      if (!sourceUrl && row.source_url) {
        sourceUrl = row.source_url;
      }
      uniquePostcodes.add(row.postcode);

      const key = `${row.category}|${row.new_value}`;
      if (!changeMap.has(key)) {
        changeMap.set(key, {
          zone: this.categoryToZoneName(row.category),
          action: row.new_value ? 'Added' : 'Deleted',
          postcodes: [],
        });
      }
      changeMap.get(key)!.postcodes.push({
        postcode: row.postcode,
        stateCode: row.state_code,
      });
    }

    return {
      date,
      totalAffected: uniquePostcodes.size,
      sourceUrl,
      changes: Array.from(changeMap.values()),
    };
  }

  // ── Last Update Info ──────────────────────────────────────────────────────

  async getLastUpdateInfo(visaType: string): Promise<LastUpdateResponse> {
    const lastEntry = await this.prisma.postcodeEligibilityHistory.findFirst({
      where: { visaType },
      orderBy: { effectiveDate: 'desc' },
      select: { effectiveDate: true, sourceUrl: true },
    });

    return {
      lastUpdateDate: lastEntry?.effectiveDate?.toISOString() ?? null,
      sourceUrl: lastEntry?.sourceUrl ?? null,
    };
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private pickBadgeFlags(elig: PostcodeBadgeData): PostcodeBadgeData {
    return {
      isRemoteVeryRemote: elig.isRemoteVeryRemote,
      isNorthernAustralia: elig.isNorthernAustralia,
      isRegionalAustralia: elig.isRegionalAustralia,
      isBushfireDeclared: elig.isBushfireDeclared,
      isNaturalDisasterDeclared: elig.isNaturalDisasterDeclared,
    };
  }

  private getActiveZones(elig: PostcodeBadgeData): string[] {
    return Object.entries(ZONE_FLAG_MAP)
      .filter((e): e is [string, string] => e[1] !== null)
      .filter(([, flag]) => elig[flag as keyof typeof elig])
      .map(([zone]) => zone);
  }

  private categoryToZoneName(category: string): string {
    return DB_CATEGORY_TO_ZONE[category] ?? category;
  }

  private mapPostcodeToResponse(p: PostcodeRecord): PostcodeResponse {
    return {
      postcode: p.postcode,
      lastUpdated: p.lastUpdated?.toISOString() ?? null,
    };
  }

  private mapSuburbToResponse(s: SuburbWithPostcodeRecord): SuburbWithPostcode {
    // Find the first available eligibility record (prefer 417)
    const eligibility =
      s.postcodeRef?.eligibility?.find((e) => e.visaType === '417') ??
      s.postcodeRef?.eligibility?.[0] ??
      null;

    return {
      id: s.id,
      suburbName: s.suburbName,
      postcode: s.postcode,
      stateCode: s.stateCode,
      postcodeData: eligibility ? this.pickBadgeFlags(eligibility) : null,
    };
  }
}
