import type {
  Postcode as PostcodeResponse,
  PostcodeDirectoryEntry,
  PostcodeHistoryEntry,
  SuburbWithPostcode,
} from '@regranted/shared';
import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import type { Postcode as PostcodeRecord, Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

const SUBURB_INCLUDE = {
  postcodeRef: {
    include: {
      eligibility: true,
    },
  },
} as const;

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

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

  async getDirectory(visaType: string, date?: string): Promise<PostcodeDirectoryEntry[]> {
    if (date) {
      return this.getHistoricalDirectory(visaType, date);
    }

    const cacheKey = `directory:${visaType}`;
    const cached = await this.cacheManager.get<PostcodeDirectoryEntry[]>(cacheKey);
    if (cached) return cached;

    const eligibility = await this.prisma.postcodeEligibility.findMany({
      where: { visaType },
      orderBy: { postcode: 'asc' },
    });

    const result: PostcodeDirectoryEntry[] = eligibility.map((e) => ({
      postcode: e.postcode,
      isRemoteVeryRemote: e.isRemoteVeryRemote,
      isNorthernAustralia: e.isNorthernAustralia,
      isRegionalAustralia: e.isRegionalAustralia,
      isBushfireDeclared: e.isBushfireDeclared,
      isNaturalDisasterDeclared: e.isNaturalDisasterDeclared,
    }));

    await this.cacheManager.set(cacheKey, result, CACHE_TTL_MS);
    return result;
  }

  async getPostcodeHistory(postcode: string, visaType: string): Promise<PostcodeHistoryEntry[]> {
    const history = await this.prisma.postcodeEligibilityHistory.findMany({
      where: { postcode, visaType },
      orderBy: { effectiveDate: 'asc' },
    });

    return history.map((h) => ({
      effectiveDate: h.effectiveDate.toISOString().split('T')[0],
      category: h.category,
      action: h.newValue ? ('ENTERED' as const) : ('LEFT' as const),
      sourceType: h.sourceType,
    }));
  }

  private async getHistoricalDirectory(
    visaType: string,
    date: string,
  ): Promise<PostcodeDirectoryEntry[]> {
    const rows = await this.prisma.$queryRaw<
      Array<{
        postcode: string;
        is_remote_very_remote: boolean;
        is_northern_australia: boolean;
        is_regional_australia: boolean;
        is_bushfire_declared: boolean;
        is_natural_disaster_declared: boolean;
      }>
    >`
      WITH latest_per_flag AS (
        SELECT DISTINCT ON (postcode, category)
          postcode, category, new_value
        FROM postcode_eligibility_history
        WHERE visa_type = ${visaType}
          AND effective_date <= ${date}::date
        ORDER BY postcode, category, effective_date DESC
      )
      SELECT
        p.postcode,
        COALESCE(MAX(CASE WHEN lf.category = 'is_remote_very_remote' THEN lf.new_value END), false) AS is_remote_very_remote,
        COALESCE(MAX(CASE WHEN lf.category = 'is_northern_australia' THEN lf.new_value END), false) AS is_northern_australia,
        COALESCE(MAX(CASE WHEN lf.category = 'is_regional_australia' THEN lf.new_value END), false) AS is_regional_australia,
        COALESCE(MAX(CASE WHEN lf.category = 'is_bushfire_declared' THEN lf.new_value END), false) AS is_bushfire_declared,
        COALESCE(MAX(CASE WHEN lf.category = 'is_natural_disaster_declared' THEN lf.new_value END), false) AS is_natural_disaster_declared
      FROM postcodes p
      LEFT JOIN latest_per_flag lf ON lf.postcode = p.postcode
      GROUP BY p.postcode
      ORDER BY p.postcode
    `;

    return rows.map((r) => ({
      postcode: r.postcode,
      isRemoteVeryRemote: r.is_remote_very_remote,
      isNorthernAustralia: r.is_northern_australia,
      isRegionalAustralia: r.is_regional_australia,
      isBushfireDeclared: r.is_bushfire_declared,
      isNaturalDisasterDeclared: r.is_natural_disaster_declared,
    }));
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
