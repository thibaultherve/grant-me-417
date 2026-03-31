/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { PostcodesService } from '../postcodes.service';

jest.mock('@regranted/shared');

/** Extract the `where` clause from the first call to a Prisma mock. */
function getWhereArg(mock: jest.Mock): Record<string, unknown> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return mock.mock.calls[0][0].where as Record<string, unknown>;
}

const mockPrisma = {
  postcode: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
  },
  suburb: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  postcodeEligibilityHistory: {
    findMany: jest.fn(),
  },
  scrapeRun: {
    findFirst: jest.fn(),
  },
  $queryRaw: jest.fn(),
};

const mockCache = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

describe('PostcodesService', () => {
  let service: PostcodesService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostcodesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CACHE_MANAGER, useValue: mockCache },
      ],
    }).compile();

    service = module.get<PostcodesService>(PostcodesService);
  });

  // ── searchPostcodes ──────────────────────────────────────────────────────

  describe('searchPostcodes', () => {
    it('should return empty array for queries shorter than 2 chars', async () => {
      const result = await service.searchPostcodes('2');
      expect(result).toEqual([]);
      expect(mockPrisma.postcode.findMany).not.toHaveBeenCalled();
    });

    it('should return cached results when available', async () => {
      const cached = [{ postcode: '2830', lastUpdated: null }];
      mockCache.get.mockResolvedValue(cached);

      const result = await service.searchPostcodes('28');
      expect(result).toEqual(cached);
      expect(mockPrisma.postcode.findMany).not.toHaveBeenCalled();
    });

    it('should query DB and cache results on cache miss', async () => {
      mockCache.get.mockResolvedValue(null);
      mockPrisma.postcode.findMany.mockResolvedValue([
        { postcode: '2830', lastUpdated: null },
        { postcode: '2831', lastUpdated: new Date('2026-01-01') },
      ]);

      const result = await service.searchPostcodes('283');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ postcode: '2830', lastUpdated: null });
      expect(result[1].postcode).toBe('2831');
      expect(mockCache.set).toHaveBeenCalledWith(
        'postcodes:283:5',
        expect.any(Array),
        300000,
      );
    });
  });

  // ── searchSuburbs ────────────────────────────────────────────────────────

  describe('searchSuburbs', () => {
    it('should return empty array for queries shorter than 2 chars', async () => {
      const result = await service.searchSuburbs('D');
      expect(result).toEqual([]);
    });

    it('should search by postcode prefix when query is numeric', async () => {
      mockCache.get.mockResolvedValue(null);
      mockPrisma.suburb.findMany.mockResolvedValue([
        {
          id: 1,
          suburbName: 'Dubbo',
          postcode: '2830',
          stateCode: 'NSW',
          postcodeRef: {
            eligibility: [
              {
                visaType: '417',
                isRemoteVeryRemote: true,
                isNorthernAustralia: false,
                isRegionalAustralia: true,
                isBushfireDeclared: false,
                isNaturalDisasterDeclared: false,
              },
            ],
          },
        },
      ]);

      const result = await service.searchSuburbs('28');

      expect(result).toHaveLength(1);
      expect(result[0].suburbName).toBe('Dubbo');
      expect(result[0].postcodeData).toEqual({
        isRemoteVeryRemote: true,
        isNorthernAustralia: false,
        isRegionalAustralia: true,
        isBushfireDeclared: false,
        isNaturalDisasterDeclared: false,
      });
    });

    it('should search by suburb name when query is text', async () => {
      mockCache.get.mockResolvedValue(null);
      mockPrisma.suburb.findMany.mockResolvedValue([]);

      await service.searchSuburbs('Dub');

      expect(mockPrisma.suburb.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { suburbName: { startsWith: 'Dub', mode: 'insensitive' } },
        }),
      );
    });
  });

  // ── getSuburbById ────────────────────────────────────────────────────────

  describe('getSuburbById', () => {
    it('should return null when suburb not found', async () => {
      mockPrisma.suburb.findUnique.mockResolvedValue(null);
      const result = await service.getSuburbById(999);
      expect(result).toBeNull();
    });

    it('should return mapped suburb with eligibility data', async () => {
      mockPrisma.suburb.findUnique.mockResolvedValue({
        id: 1,
        suburbName: 'Dubbo',
        postcode: '2830',
        stateCode: 'NSW',
        postcodeRef: {
          eligibility: [
            {
              visaType: '417',
              isRemoteVeryRemote: false,
              isNorthernAustralia: false,
              isRegionalAustralia: true,
              isBushfireDeclared: false,
              isNaturalDisasterDeclared: false,
            },
          ],
        },
      });

      const result = await service.getSuburbById(1);

      expect(result).toEqual({
        id: 1,
        suburbName: 'Dubbo',
        postcode: '2830',
        stateCode: 'NSW',
        postcodeData: {
          isRemoteVeryRemote: false,
          isNorthernAustralia: false,
          isRegionalAustralia: true,
          isBushfireDeclared: false,
          isNaturalDisasterDeclared: false,
        },
      });
    });
  });

  // ── getPostcodeHistory ───────────────────────────────────────────────────

  describe('getPostcodeHistory', () => {
    it('should return mapped history entries', async () => {
      mockPrisma.postcodeEligibilityHistory.findMany.mockResolvedValue([
        {
          effectiveDate: new Date('2026-01-15'),
          category: 'is_regional_australia',
          newValue: true,
          sourceType: 'scrape',
        },
        {
          effectiveDate: new Date('2026-03-01'),
          category: 'is_northern_australia',
          newValue: false,
          sourceType: 'manual',
        },
      ]);

      const result = await service.getPostcodeHistory('2830', '417');

      expect(result).toEqual([
        {
          effectiveDate: '2026-01-15',
          category: 'is_regional_australia',
          action: 'ENTERED',
          sourceType: 'scrape',
        },
        {
          effectiveDate: '2026-03-01',
          category: 'is_northern_australia',
          action: 'LEFT',
          sourceType: 'manual',
        },
      ]);
    });

    it('should return empty array when no history exists', async () => {
      mockPrisma.postcodeEligibilityHistory.findMany.mockResolvedValue([]);
      const result = await service.getPostcodeHistory('9999', '417');
      expect(result).toEqual([]);
    });
  });

  // ── getPaginatedDirectory ────────────────────────────────────────────────

  describe('getPaginatedDirectory', () => {
    const userId = 'user-1';

    const baseParams = {
      visaType: '417' as const,
      page: 1,
      limit: 15,
      sort: 'asc' as const,
    };

    const mockPostcodeRow = (postcode: string, stateCode: string) => ({
      postcode,
      suburbs: [
        { suburbName: 'Suburb A', stateCode },
        { suburbName: 'Suburb B', stateCode },
      ],
      eligibility: [
        {
          visaType: '417',
          isNorthernAustralia: false,
          isRemoteVeryRemote: true,
          isRegionalAustralia: true,
          isBushfireDeclared: false,
          isNaturalDisasterDeclared: false,
        },
      ],
      favoritedBy: [],
    });

    it('should return paginated results with default params', async () => {
      mockPrisma.postcode.count.mockResolvedValue(50);
      mockPrisma.postcode.findMany.mockResolvedValue([
        mockPostcodeRow('2830', 'NSW'),
        mockPostcodeRow('2831', 'NSW'),
      ]);

      const result = await service.getPaginatedDirectory(baseParams, userId);

      expect(result.total).toBe(50);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(15);
      expect(result.totalPages).toBe(4);
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toEqual({
        postcode: '2830',
        stateCode: 'NSW',
        zones: ['remote', 'regional'],
        suburbs: ['Suburb A', 'Suburb B'],
        isFavorite: false,
      });
    });

    it('should apply state filter', async () => {
      mockPrisma.postcode.count.mockResolvedValue(0);
      mockPrisma.postcode.findMany.mockResolvedValue([]);

      await service.getPaginatedDirectory(
        { ...baseParams, states: ['NSW', 'QLD'] },
        userId,
      );

      const whereArg = getWhereArg(mockPrisma.postcode.findMany);
      expect(whereArg.AND).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            suburbs: { some: { stateCode: { in: ['NSW', 'QLD'] } } },
          }),
        ]),
      );
    });

    it('should apply numeric search filter on postcode prefix', async () => {
      mockPrisma.postcode.count.mockResolvedValue(0);
      mockPrisma.postcode.findMany.mockResolvedValue([]);

      await service.getPaginatedDirectory(
        { ...baseParams, search: '283' },
        userId,
      );

      const whereArg = getWhereArg(mockPrisma.postcode.findMany);
      expect(whereArg.AND).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ postcode: { startsWith: '283' } }),
        ]),
      );
    });

    it('should apply text search filter on suburb name', async () => {
      mockPrisma.postcode.count.mockResolvedValue(0);
      mockPrisma.postcode.findMany.mockResolvedValue([]);

      await service.getPaginatedDirectory(
        { ...baseParams, search: 'Dubbo' },
        userId,
      );

      const whereArg = getWhereArg(mockPrisma.postcode.findMany);
      expect(whereArg.AND).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            suburbs: {
              some: { suburbName: { contains: 'Dubbo', mode: 'insensitive' } },
            },
          }),
        ]),
      );
    });

    it('should apply zone filter', async () => {
      mockPrisma.postcode.count.mockResolvedValue(0);
      mockPrisma.postcode.findMany.mockResolvedValue([]);

      await service.getPaginatedDirectory(
        { ...baseParams, zones: ['northern', 'remote'] },
        userId,
      );

      const whereArg = getWhereArg(mockPrisma.postcode.findMany);
      // Single condition → no AND wrapper, just the eligibility condition directly
      expect(whereArg).toEqual(
        expect.objectContaining({
          eligibility: {
            some: expect.objectContaining({
              visaType: '417',
              OR: [{ isNorthernAustralia: true }, { isRemoteVeryRemote: true }],
            }),
          },
        }),
      );
    });

    it('should apply favorites filter', async () => {
      mockPrisma.postcode.count.mockResolvedValue(0);
      mockPrisma.postcode.findMany.mockResolvedValue([]);

      await service.getPaginatedDirectory(
        { ...baseParams, favorites: true },
        userId,
      );

      const whereArg = getWhereArg(mockPrisma.postcode.findMany);
      expect(whereArg.AND).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            favoritedBy: { some: { userId } },
          }),
        ]),
      );
    });

    it('should handle pagination offset correctly', async () => {
      mockPrisma.postcode.count.mockResolvedValue(100);
      mockPrisma.postcode.findMany.mockResolvedValue([]);

      await service.getPaginatedDirectory(
        { ...baseParams, page: 3, limit: 10 },
        userId,
      );

      expect(mockPrisma.postcode.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
          orderBy: { postcode: 'asc' },
        }),
      );
    });

    it('should apply descending sort order', async () => {
      mockPrisma.postcode.count.mockResolvedValue(0);
      mockPrisma.postcode.findMany.mockResolvedValue([]);

      await service.getPaginatedDirectory(
        { ...baseParams, sort: 'desc' },
        userId,
      );

      expect(mockPrisma.postcode.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { postcode: 'desc' },
        }),
      );
    });

    it('should mark favorited postcodes', async () => {
      mockPrisma.postcode.count.mockResolvedValue(1);
      mockPrisma.postcode.findMany.mockResolvedValue([
        {
          ...mockPostcodeRow('2830', 'NSW'),
          favoritedBy: [{ userId }],
        },
      ]);

      const result = await service.getPaginatedDirectory(baseParams, userId);

      expect(result.data[0].isFavorite).toBe(true);
    });

    it('should use empty stateCode when postcode has no suburbs', async () => {
      mockPrisma.postcode.count.mockResolvedValue(1);
      mockPrisma.postcode.findMany.mockResolvedValue([
        {
          postcode: '0000',
          suburbs: [],
          eligibility: [],
          favoritedBy: [],
        },
      ]);

      const result = await service.getPaginatedDirectory(baseParams, userId);

      expect(result.data[0].stateCode).toBe('');
      expect(result.data[0].zones).toEqual([]);
    });
  });

  // ── getPostcodeDetail ────────────────────────────────────────────────────

  describe('getPostcodeDetail', () => {
    it('should return cached result when available', async () => {
      const cached = { postcode: '2830', suburbs: [] };
      mockCache.get.mockResolvedValue(cached);

      const result = await service.getPostcodeDetail('2830');

      expect(result).toEqual(cached);
      expect(mockPrisma.postcode.findUnique).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when postcode not found', async () => {
      mockCache.get.mockResolvedValue(null);
      mockPrisma.postcode.findUnique.mockResolvedValue(null);

      await expect(service.getPostcodeDetail('9999')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return full detail with suburbs, eligibility for both visa types, and history', async () => {
      mockCache.get.mockResolvedValue(null);
      mockPrisma.postcode.findUnique.mockResolvedValue({
        postcode: '2830',
        lastUpdated: new Date('2026-03-01'),
        suburbs: [
          { id: 1, suburbName: 'Dubbo', postcode: '2830', stateCode: 'NSW' },
          {
            id: 2,
            suburbName: 'Eulomogo',
            postcode: '2830',
            stateCode: 'NSW',
          },
        ],
        eligibility: [
          {
            visaType: '417',
            isRemoteVeryRemote: true,
            isNorthernAustralia: false,
            isRegionalAustralia: true,
            isBushfireDeclared: false,
            isNaturalDisasterDeclared: false,
          },
          {
            visaType: '462',
            isRemoteVeryRemote: false,
            isNorthernAustralia: true,
            isRegionalAustralia: false,
            isBushfireDeclared: false,
            isNaturalDisasterDeclared: false,
          },
        ],
        history: [
          {
            effectiveDate: new Date('2026-03-01'),
            category: 'is_regional_australia',
            newValue: true,
            visaType: '417',
          },
        ],
      });

      const result = await service.getPostcodeDetail('2830');

      expect(result.postcode).toBe('2830');
      expect(result.lastUpdated).toBe('2026-03-01T00:00:00.000Z');
      expect(result.suburbs).toHaveLength(2);
      expect(result.suburbs[0]).toEqual({
        id: 1,
        suburbName: 'Dubbo',
        postcode: '2830',
        stateCode: 'NSW',
      });
      expect(result.eligibility417).toEqual({
        isRemoteVeryRemote: true,
        isNorthernAustralia: false,
        isRegionalAustralia: true,
        isBushfireDeclared: false,
        isNaturalDisasterDeclared: false,
      });
      expect(result.eligibility462).toEqual({
        isRemoteVeryRemote: false,
        isNorthernAustralia: true,
        isRegionalAustralia: false,
        isBushfireDeclared: false,
        isNaturalDisasterDeclared: false,
      });
      expect(result.history).toEqual([
        {
          effectiveDate: '2026-03-01',
          category: 'is_regional_australia',
          action: 'ENTERED',
          visaType: '417',
        },
      ]);
      expect(mockCache.set).toHaveBeenCalledWith(
        'postcode-detail:2830',
        expect.any(Object),
        300000,
      );
    });

    it('should handle postcode with no eligibility data', async () => {
      mockCache.get.mockResolvedValue(null);
      mockPrisma.postcode.findUnique.mockResolvedValue({
        postcode: '0001',
        lastUpdated: null,
        suburbs: [],
        eligibility: [],
        history: [],
      });

      const result = await service.getPostcodeDetail('0001');

      expect(result.eligibility417).toBeNull();
      expect(result.eligibility462).toBeNull();
      expect(result.lastUpdated).toBeNull();
      expect(result.history).toEqual([]);
    });
  });

  // ── getGlobalChanges ─────────────────────────────────────────────────────

  describe('getGlobalChanges', () => {
    it('should return empty response when no changes exist', async () => {
      mockPrisma.$queryRaw.mockResolvedValueOnce([{ count: BigInt(0) }]);

      const result = await service.getGlobalChanges('417', 1, 10);

      expect(result).toEqual({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
    });

    it('should return grouped changes with postcodes and pagination', async () => {
      // Step 1: count query
      mockPrisma.$queryRaw.mockResolvedValueOnce([{ count: BigInt(2) }]);

      // Step 2: data query
      const date = new Date('2026-03-15');
      mockPrisma.$queryRaw.mockResolvedValueOnce([
        {
          effective_date: date,
          category: 'is_regional_australia',
          new_value: true,
          source_url: 'https://immi.homeaffairs.gov.au',
          postcode: '2830',
          state_code: 'NSW',
        },
        {
          effective_date: date,
          category: 'is_regional_australia',
          new_value: true,
          source_url: 'https://immi.homeaffairs.gov.au',
          postcode: '2831',
          state_code: 'NSW',
        },
        {
          effective_date: date,
          category: 'is_northern_australia',
          new_value: false,
          source_url: null,
          postcode: '4000',
          state_code: 'QLD',
        },
      ]);

      const result = await service.getGlobalChanges('417', 1, 10);

      expect(result.total).toBe(2);
      expect(result.totalPages).toBe(1);
      expect(result.data).toHaveLength(2);

      // First group: regional Added with 2 postcodes
      const regionalGroup = result.data.find((d) => d.zone === 'regional');
      expect(regionalGroup).toBeDefined();
      expect(regionalGroup!.action).toBe('Added');
      expect(regionalGroup!.postcodes).toHaveLength(2);
      expect(regionalGroup!.sourceUrl).toBe('https://immi.homeaffairs.gov.au');

      // Second group: northern Deleted with 1 postcode
      const northernGroup = result.data.find((d) => d.zone === 'northern');
      expect(northernGroup).toBeDefined();
      expect(northernGroup!.action).toBe('Deleted');
      expect(northernGroup!.postcodes).toEqual([
        { postcode: '4000', stateCode: 'QLD' },
      ]);
    });
  });

  // ── getLastUpdateInfo ────────────────────────────────────────────────────

  describe('getLastUpdateInfo', () => {
    it('should return last update date and source URL', async () => {
      mockPrisma.scrapeRun.findFirst.mockResolvedValue({
        runAt: new Date('2026-03-20T12:00:00Z'),
        sourceUrl: 'https://immi.homeaffairs.gov.au',
      });

      const result = await service.getLastUpdateInfo();

      expect(result).toEqual({
        lastUpdateDate: '2026-03-20T12:00:00.000Z',
        sourceUrl: 'https://immi.homeaffairs.gov.au',
      });
    });

    it('should return nulls when no scrape run with changes exists', async () => {
      mockPrisma.scrapeRun.findFirst.mockResolvedValue(null);

      const result = await service.getLastUpdateInfo();

      expect(result).toEqual({
        lastUpdateDate: null,
        sourceUrl: null,
      });
    });
  });
});
