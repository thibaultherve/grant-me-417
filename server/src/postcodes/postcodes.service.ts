import type {
  Postcode as PostcodeResponse,
  PostcodeHistoryEntry,
  SuburbWithPostcode,
  PaginatedDirectoryQuery,
  PaginatedDirectoryResponse,
  PostcodeDetailResponse,
  GlobalChangesResponse,
  LastUpdateResponse,
} from '@regranted/shared';
import { ZONE_FLAG_MAP } from '@regranted/shared';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import type {
  Postcode as PostcodeRecord,
  Prisma,
} from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { formatDate } from '../common/utils/format.js';

const SUBURB_INCLUDE = {
  postcodeRef: {
    include: {
      eligibility: true,
    },
  },
} as const;

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/** Reverse map from snake_case DB column name → zone name (e.g. 'is_northern_australia' → 'northern') */
const DB_CATEGORY_TO_ZONE: Record<string, string> = {
  is_northern_australia: 'northern',
  is_remote_very_remote: 'remote',
  is_regional_australia: 'regional',
  is_bushfire_declared: 'bushfire',
  is_natural_disaster_declared: 'weather',
};

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
      eligibility417: elig417 ? this.mapEligibilityFlags(elig417) : null,
      eligibility462: elig462 ? this.mapEligibilityFlags(elig462) : null,
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

  // ── Global Changes ────────────────────────────────────────────────────────

  async getGlobalChanges(
    visaType: string,
    page: number,
    limit: number,
  ): Promise<GlobalChangesResponse> {
    // Step 1: Count distinct groups
    const countResult = await this.prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM (
        SELECT DISTINCT effective_date, category, new_value
        FROM postcode_eligibility_history
        WHERE visa_type = ${visaType}
      ) g
    `;
    const total = Number(countResult[0].count);

    if (total === 0) {
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }

    // Step 2: Get paginated groups with postcodes + state codes in one query
    const rows = await this.prisma.$queryRaw<
      Array<{
        effective_date: Date;
        category: string;
        new_value: boolean;
        source_url: string | null;
        postcode: string;
        state_code: string | null;
      }>
    >`
      WITH groups AS (
        SELECT
          effective_date, category, new_value,
          MIN(source_url) as source_url,
          ROW_NUMBER() OVER (ORDER BY effective_date DESC, category, new_value DESC) as rn
        FROM postcode_eligibility_history
        WHERE visa_type = ${visaType}
        GROUP BY effective_date, category, new_value
      ),
      paginated AS (
        SELECT * FROM groups
        WHERE rn > ${(page - 1) * limit} AND rn <= ${page * limit}
      )
      SELECT
        p.effective_date, p.category, p.new_value, p.source_url,
        h.postcode,
        (SELECT s.state_code FROM suburbs s WHERE s.postcode = h.postcode ORDER BY s.suburb_name LIMIT 1) as state_code
      FROM paginated p
      JOIN postcode_eligibility_history h
        ON h.effective_date = p.effective_date
        AND h.category = p.category
        AND h.new_value = p.new_value
        AND h.visa_type = ${visaType}
      GROUP BY p.effective_date, p.category, p.new_value, p.source_url, h.postcode
      ORDER BY p.effective_date DESC, p.category, h.postcode
    `;

    // Step 3: Group flat rows into nested response
    const groupMap = new Map<
      string,
      {
        effectiveDate: string;
        zone: string;
        action: 'Added' | 'Deleted';
        postcodes: Array<{ postcode: string; stateCode: string }>;
        sourceUrl: string | null;
      }
    >();

    for (const row of rows) {
      const key = `${row.effective_date.toISOString()}|${row.category}|${row.new_value}`;
      if (!groupMap.has(key)) {
        groupMap.set(key, {
          effectiveDate: formatDate(row.effective_date),
          zone: this.categoryToZoneName(row.category),
          action: row.new_value ? 'Added' : 'Deleted',
          postcodes: [],
          sourceUrl: row.source_url,
        });
      }
      groupMap.get(key)!.postcodes.push({
        postcode: row.postcode,
        stateCode: row.state_code ?? '',
      });
    }

    return {
      data: Array.from(groupMap.values()),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
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

  private getActiveZones(elig: {
    isNorthernAustralia: boolean;
    isRemoteVeryRemote: boolean;
    isRegionalAustralia: boolean;
    isBushfireDeclared: boolean;
    isNaturalDisasterDeclared: boolean;
  }): string[] {
    const zones: string[] = [];
    if (elig.isNorthernAustralia) zones.push('northern');
    if (elig.isRemoteVeryRemote) zones.push('remote');
    if (elig.isRegionalAustralia) zones.push('regional');
    if (elig.isBushfireDeclared) zones.push('bushfire');
    if (elig.isNaturalDisasterDeclared) zones.push('weather');
    return zones;
  }

  private categoryToZoneName(category: string): string {
    return DB_CATEGORY_TO_ZONE[category] ?? category;
  }

  private mapEligibilityFlags(elig: {
    isRemoteVeryRemote: boolean;
    isNorthernAustralia: boolean;
    isRegionalAustralia: boolean;
    isBushfireDeclared: boolean;
    isNaturalDisasterDeclared: boolean;
  }) {
    return {
      isRemoteVeryRemote: elig.isRemoteVeryRemote,
      isNorthernAustralia: elig.isNorthernAustralia,
      isRegionalAustralia: elig.isRegionalAustralia,
      isBushfireDeclared: elig.isBushfireDeclared,
      isNaturalDisasterDeclared: elig.isNaturalDisasterDeclared,
    };
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
      postcodeData: eligibility
        ? {
            isRemoteVeryRemote: eligibility.isRemoteVeryRemote,
            isNorthernAustralia: eligibility.isNorthernAustralia,
            isRegionalAustralia: eligibility.isRegionalAustralia,
            isBushfireDeclared: eligibility.isBushfireDeclared,
            isNaturalDisasterDeclared: eligibility.isNaturalDisasterDeclared,
          }
        : null,
    };
  }
}
