import { Injectable } from '@nestjs/common';
import type {
  Postcode as PostcodeRecord,
  Prisma,
} from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  Postcode as PostcodeResponse,
  SuburbWithPostcode,
} from '@get-granted/shared';

const SUBURB_INCLUDE = {
  postcodeRef: {
    select: {
      isRemoteVeryRemote: true,
      isNorthernAustralia: true,
      isRegionalAustralia: true,
      isBushfireDeclared: true,
      isNaturalDisasterDeclared: true,
    },
  },
} as const;

type SuburbWithPostcodeRecord = Prisma.SuburbGetPayload<{
  include: typeof SUBURB_INCLUDE;
}>;

@Injectable()
export class PostcodesService {
  constructor(private prisma: PrismaService) {}

  async searchPostcodes(
    query: string,
    limit = 5,
  ): Promise<PostcodeResponse[]> {
    const postcodes = await this.prisma.postcode.findMany({
      where: {
        postcode: { startsWith: query },
      },
      take: limit,
      orderBy: { postcode: 'asc' },
    });

    return postcodes.map((p) => this.mapPostcodeToResponse(p));
  }

  async searchSuburbs(
    query: string,
    limit = 10,
  ): Promise<SuburbWithPostcode[]> {
    const isNumeric = /^\d+$/.test(query);

    const suburbs = await this.prisma.suburb.findMany({
      where: isNumeric
        ? { postcode: { startsWith: query } }
        : { suburbName: { startsWith: query, mode: 'insensitive' } },
      include: SUBURB_INCLUDE,
      take: limit,
      orderBy: isNumeric ? { postcode: 'asc' } : { suburbName: 'asc' },
    });

    return suburbs.map((s) => this.mapSuburbToResponse(s));
  }

  async getSuburbById(id: number): Promise<SuburbWithPostcode | null> {
    const suburb = await this.prisma.suburb.findUnique({
      where: { id },
      include: SUBURB_INCLUDE,
    });

    if (!suburb) return null;

    return this.mapSuburbToResponse(suburb);
  }

  private mapPostcodeToResponse(p: PostcodeRecord): PostcodeResponse {
    return {
      postcode: p.postcode,
      isRemoteVeryRemote: p.isRemoteVeryRemote ?? false,
      isNorthernAustralia: p.isNorthernAustralia ?? false,
      isRegionalAustralia: p.isRegionalAustralia ?? false,
      isBushfireDeclared: p.isBushfireDeclared ?? false,
      isNaturalDisasterDeclared: p.isNaturalDisasterDeclared ?? false,
      lastUpdated: p.lastUpdated?.toISOString() ?? null,
      lastScraped: p.lastScraped?.toISOString() ?? null,
    };
  }

  private mapSuburbToResponse(s: SuburbWithPostcodeRecord): SuburbWithPostcode {
    return {
      id: s.id,
      suburbName: s.suburbName,
      postcode: s.postcode,
      stateCode: s.stateCode,
      postcodeData: s.postcodeRef
        ? {
            isRemoteVeryRemote: s.postcodeRef.isRemoteVeryRemote ?? false,
            isNorthernAustralia: s.postcodeRef.isNorthernAustralia ?? false,
            isRegionalAustralia: s.postcodeRef.isRegionalAustralia ?? false,
            isBushfireDeclared: s.postcodeRef.isBushfireDeclared ?? false,
            isNaturalDisasterDeclared:
              s.postcodeRef.isNaturalDisasterDeclared ?? false,
          }
        : null,
    };
  }
}
