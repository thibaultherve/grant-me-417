/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { FavoritesController } from '../favorites.controller';
import { FavoritesService } from '../favorites.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

jest.mock('@regranted/shared');

const mockService = {
  toggle: jest.fn(),
  getUserFavorites: jest.fn(),
};

describe('FavoritesController', () => {
  let controller: FavoritesController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FavoritesController],
      providers: [{ provide: FavoritesService, useValue: mockService }],
    }).compile();

    controller = module.get<FavoritesController>(FavoritesController);
  });

  describe('guard metadata', () => {
    it('should have JwtAuthGuard applied at controller level', () => {
      const guards = Reflect.getMetadata('__guards__', FavoritesController);
      expect(guards).toBeDefined();
      expect(guards).toContainEqual(JwtAuthGuard);
    });
  });

  describe('POST /user/favorites/postcodes', () => {
    it('should delegate to service.toggle with userId from JWT', async () => {
      const user = { sub: 'user-1', email: 'test@test.com' };
      mockService.toggle.mockResolvedValue({ action: 'added' });

      const result = await controller.toggle(user, { postcode: '2830' });

      expect(result).toEqual({ action: 'added' });
      expect(mockService.toggle).toHaveBeenCalledWith('user-1', '2830');
    });

    it('should pass userId from JWT, not from request body', async () => {
      const user = { sub: 'authenticated-user', email: 'auth@test.com' };
      mockService.toggle.mockResolvedValue({ action: 'removed' });

      await controller.toggle(user, { postcode: '4000' });

      expect(mockService.toggle).toHaveBeenCalledWith(
        'authenticated-user',
        '4000',
      );
    });
  });

  describe('GET /user/favorites/postcodes', () => {
    it('should delegate to service.getUserFavorites with userId from JWT', async () => {
      const user = { sub: 'user-1', email: 'test@test.com' };
      const expected = [
        { postcode: '2830', createdAt: '2026-03-15T10:00:00.000Z' },
      ];
      mockService.getUserFavorites.mockResolvedValue(expected);

      const result = await controller.getUserFavorites(user);

      expect(result).toEqual(expected);
      expect(mockService.getUserFavorites).toHaveBeenCalledWith('user-1');
    });

    it('should return empty array when user has no favorites', async () => {
      const user = { sub: 'user-2', email: 'user2@test.com' };
      mockService.getUserFavorites.mockResolvedValue([]);

      const result = await controller.getUserFavorites(user);

      expect(result).toEqual([]);
    });
  });
});
