import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '../../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { FavoritesService } from '../favorites.service';

const mockPrisma = {
  postcode: {
    findUnique: jest.fn(),
  },
  userFavoritePostcode: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  },
  $transaction: jest.fn(),
};

describe('FavoritesService', () => {
  let service: FavoritesService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<FavoritesService>(FavoritesService);
  });

  describe('toggle', () => {
    const userId = 'user-1';
    const postcode = '2830';

    it('should throw NotFoundException if postcode does not exist', async () => {
      mockPrisma.postcode.findUnique.mockResolvedValue(null);

      await expect(service.toggle(userId, postcode)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrisma.postcode.findUnique).toHaveBeenCalledWith({
        where: { postcode },
      });
    });

    it('should remove favorite if it already exists', async () => {
      mockPrisma.postcode.findUnique.mockResolvedValue({ postcode });

      const txMock = {
        userFavoritePostcode: {
          findUnique: jest
            .fn()
            .mockResolvedValue({ userId, postcode, createdAt: new Date() }),
          delete: jest.fn().mockResolvedValue({}),
          count: jest.fn(),
          create: jest.fn(),
        },
      };
      mockPrisma.$transaction.mockImplementation(
        (cb: (tx: typeof txMock) => unknown) => cb(txMock),
      );

      const result = await service.toggle(userId, postcode);

      expect(result).toEqual({ action: 'removed' });
      expect(txMock.userFavoritePostcode.findUnique).toHaveBeenCalledWith({
        where: { userId_postcode: { userId, postcode } },
      });
      expect(txMock.userFavoritePostcode.delete).toHaveBeenCalledWith({
        where: { userId_postcode: { userId, postcode } },
      });
    });

    it('should add favorite if it does not exist', async () => {
      mockPrisma.postcode.findUnique.mockResolvedValue({ postcode });

      const txMock = {
        userFavoritePostcode: {
          findUnique: jest.fn().mockResolvedValue(null),
          count: jest.fn().mockResolvedValue(5),
          create: jest
            .fn()
            .mockResolvedValue({ userId, postcode, createdAt: new Date() }),
          delete: jest.fn(),
        },
      };
      mockPrisma.$transaction.mockImplementation(
        (cb: (tx: typeof txMock) => unknown) => cb(txMock),
      );

      const result = await service.toggle(userId, postcode);

      expect(result).toEqual({ action: 'added' });
      expect(txMock.userFavoritePostcode.count).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(txMock.userFavoritePostcode.create).toHaveBeenCalledWith({
        data: { userId, postcode },
      });
    });

    it('should throw BadRequestException when max favorites reached', async () => {
      mockPrisma.postcode.findUnique.mockResolvedValue({ postcode });

      mockPrisma.$transaction.mockImplementation(
        async (cb: (tx: Record<string, unknown>) => unknown) => {
          const tx = {
            userFavoritePostcode: {
              findUnique: jest.fn().mockResolvedValue(null),
              count: jest.fn().mockResolvedValue(100),
              create: jest.fn(),
              delete: jest.fn(),
            },
          };
          return await cb(tx);
        },
      );

      await expect(service.toggle(userId, postcode)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle P2002 duplicate key race condition gracefully', async () => {
      mockPrisma.postcode.findUnique.mockResolvedValue({ postcode });

      const p2002Error = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        { code: 'P2002', clientVersion: '5.0.0' },
      );

      mockPrisma.$transaction.mockImplementation(
        async (cb: (tx: Record<string, unknown>) => unknown) => {
          const tx = {
            userFavoritePostcode: {
              findUnique: jest.fn().mockResolvedValue(null),
              count: jest.fn().mockResolvedValue(5),
              create: jest.fn().mockRejectedValue(p2002Error),
              delete: jest.fn(),
            },
          };
          return await cb(tx);
        },
      );

      const result = await service.toggle(userId, postcode);

      expect(result).toEqual({ action: 'added' });
    });

    it('should rethrow non-P2002 errors from create', async () => {
      mockPrisma.postcode.findUnique.mockResolvedValue({ postcode });

      const genericError = new Error('Database connection lost');

      mockPrisma.$transaction.mockImplementation(
        async (cb: (tx: Record<string, unknown>) => unknown) => {
          const tx = {
            userFavoritePostcode: {
              findUnique: jest.fn().mockResolvedValue(null),
              count: jest.fn().mockResolvedValue(5),
              create: jest.fn().mockRejectedValue(genericError),
              delete: jest.fn(),
            },
          };
          return await cb(tx);
        },
      );

      await expect(service.toggle(userId, postcode)).rejects.toThrow(
        'Database connection lost',
      );
    });
  });

  describe('getUserFavorites', () => {
    const userId = 'user-1';

    it('should return formatted favorites sorted by recency', async () => {
      const now = new Date('2026-03-15T10:00:00Z');
      const earlier = new Date('2026-03-10T08:00:00Z');

      mockPrisma.userFavoritePostcode.findMany.mockResolvedValue([
        { userId, postcode: '2830', createdAt: now },
        { userId, postcode: '4000', createdAt: earlier },
      ]);

      const result = await service.getUserFavorites(userId);

      expect(result).toEqual([
        { postcode: '2830', createdAt: now.toISOString() },
        { postcode: '4000', createdAt: earlier.toISOString() },
      ]);
      expect(mockPrisma.userFavoritePostcode.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when user has no favorites', async () => {
      mockPrisma.userFavoritePostcode.findMany.mockResolvedValue([]);

      const result = await service.getUserFavorites(userId);

      expect(result).toEqual([]);
    });
  });

  describe('isFavorite', () => {
    const userId = 'user-1';
    const postcode = '2830';

    it('should return true when favorite exists', async () => {
      mockPrisma.userFavoritePostcode.findUnique.mockResolvedValue({
        userId,
        postcode,
        createdAt: new Date(),
      });

      const result = await service.isFavorite(userId, postcode);

      expect(result).toBe(true);
      expect(mockPrisma.userFavoritePostcode.findUnique).toHaveBeenCalledWith({
        where: { userId_postcode: { userId, postcode } },
      });
    });

    it('should return false when favorite does not exist', async () => {
      mockPrisma.userFavoritePostcode.findUnique.mockResolvedValue(null);

      const result = await service.isFavorite(userId, postcode);

      expect(result).toBe(false);
    });
  });
});
