/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PostcodesController } from '../postcodes.controller';
import { PostcodesService } from '../postcodes.service';

jest.mock('@regranted/shared');

const mockService = {
  searchPostcodes: jest.fn(),
  searchSuburbs: jest.fn(),
  getSuburbById: jest.fn(),
  getPostcodeHistory: jest.fn(),
  getPaginatedDirectory: jest.fn(),
  getPostcodeDetail: jest.fn(),
  getGlobalChanges: jest.fn(),
  getLastUpdateInfo: jest.fn(),
};

describe('PostcodesController', () => {
  let controller: PostcodesController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostcodesController],
      providers: [{ provide: PostcodesService, useValue: mockService }],
    }).compile();

    controller = module.get<PostcodesController>(PostcodesController);
  });

  describe('guard metadata', () => {
    it('should not have controller-level guards (JwtAuthGuard is global via APP_GUARD)', () => {
      const guards = Reflect.getMetadata('__guards__', PostcodesController);
      expect(guards).toBeUndefined();
    });
  });

  describe('GET /postcodes/search', () => {
    it('should delegate to service.searchPostcodes', async () => {
      const expected = [{ postcode: '2830', lastUpdated: null }];
      mockService.searchPostcodes.mockResolvedValue(expected);

      const result = await controller.searchPostcodes({ q: '283' });

      expect(result).toEqual(expected);
      expect(mockService.searchPostcodes).toHaveBeenCalledWith('283');
    });
  });

  describe('GET /postcodes/directory', () => {
    it('should delegate to service.getPaginatedDirectory with query and userId', async () => {
      const query = {
        visaType: '417' as const,
        page: 1,
        limit: 15,
        sort: 'asc' as const,
      };
      const user = { sub: 'user-1', email: 'test@test.com' };
      const expected = {
        data: [],
        total: 0,
        page: 1,
        limit: 15,
        totalPages: 0,
      };
      mockService.getPaginatedDirectory.mockResolvedValue(expected);

      const result = await controller.getPaginatedDirectory(query, user);

      expect(result).toEqual(expected);
      expect(mockService.getPaginatedDirectory).toHaveBeenCalledWith(
        query,
        'user-1',
      );
    });
  });

  describe('GET /postcodes/changes', () => {
    it('should delegate to service.getGlobalChanges', async () => {
      const query = { visaType: '417' as const, page: 1, limit: 10 };
      const expected = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
      mockService.getGlobalChanges.mockResolvedValue(expected);

      const result = await controller.getGlobalChanges(query);

      expect(result).toEqual(expected);
      expect(mockService.getGlobalChanges).toHaveBeenCalledWith('417', 1, 10);
    });
  });

  describe('GET /postcodes/last-update', () => {
    it('should delegate to service.getLastUpdateInfo', async () => {
      const expected = {
        lastUpdateDate: '2026-03-20T12:00:00.000Z',
        sourceUrl: 'https://immi.homeaffairs.gov.au',
      };
      mockService.getLastUpdateInfo.mockResolvedValue(expected);

      const result = await controller.getLastUpdate({ visaType: '417' });

      expect(result).toEqual(expected);
      expect(mockService.getLastUpdateInfo).toHaveBeenCalledWith('417');
    });
  });

  describe('GET /postcodes/:postcode/history', () => {
    it('should delegate to service.getPostcodeHistory', async () => {
      const expected = [
        {
          effectiveDate: '2026-01-15',
          category: 'is_regional_australia',
          action: 'ENTERED',
          sourceType: 'scrape',
        },
      ];
      mockService.getPostcodeHistory.mockResolvedValue(expected);

      const result = await controller.getPostcodeHistory(
        { postcode: '2830' },
        { visaType: '417' },
      );

      expect(result).toEqual(expected);
      expect(mockService.getPostcodeHistory).toHaveBeenCalledWith(
        '2830',
        '417',
      );
    });
  });

  describe('GET /postcodes/:postcode', () => {
    it('should delegate to service.getPostcodeDetail', async () => {
      const expected = {
        postcode: '2830',
        suburbs: [],
        eligibility417: null,
        eligibility462: null,
        history: [],
        lastUpdated: null,
      };
      mockService.getPostcodeDetail.mockResolvedValue(expected);

      const result = await controller.getPostcodeDetail({ postcode: '2830' });

      expect(result).toEqual(expected);
      expect(mockService.getPostcodeDetail).toHaveBeenCalledWith('2830');
    });

    it('should propagate NotFoundException from service', async () => {
      mockService.getPostcodeDetail.mockRejectedValue(
        new NotFoundException('Postcode not found'),
      );

      await expect(
        controller.getPostcodeDetail({ postcode: '9999' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('GET /suburbs/search', () => {
    it('should delegate to service.searchSuburbs', async () => {
      const expected = [
        {
          id: 1,
          suburbName: 'Dubbo',
          postcode: '2830',
          stateCode: 'NSW',
          postcodeData: null,
        },
      ];
      mockService.searchSuburbs.mockResolvedValue(expected);

      const result = await controller.searchSuburbs({ q: 'Dub' });

      expect(result).toEqual(expected);
      expect(mockService.searchSuburbs).toHaveBeenCalledWith('Dub');
    });
  });

  describe('GET /suburbs/:id', () => {
    it('should return suburb when found', async () => {
      const expected = {
        id: 1,
        suburbName: 'Dubbo',
        postcode: '2830',
        stateCode: 'NSW',
        postcodeData: null,
      };
      mockService.getSuburbById.mockResolvedValue(expected);

      const result = await controller.getSuburbById({ id: 1 });

      expect(result).toEqual(expected);
    });

    it('should throw NotFoundException when suburb not found', async () => {
      mockService.getSuburbById.mockResolvedValue(null);

      await expect(controller.getSuburbById({ id: 999 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
