import type { FavoritePostcodeResponse } from '@regranted/shared';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { formatTimestamp } from '../common/utils/format.js';
import { PrismaService } from '../prisma/prisma.service.js';

const MAX_FAVORITES = 100;

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async toggle(
    userId: string,
    postcode: string,
  ): Promise<{ action: 'added' | 'removed' }> {
    const postcodeExists = await this.prisma.postcode.findUnique({
      where: { postcode },
    });
    if (!postcodeExists) {
      throw new NotFoundException('Postcode not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.userFavoritePostcode.findUnique({
        where: { userId_postcode: { userId, postcode } },
      });

      if (existing) {
        await tx.userFavoritePostcode.delete({
          where: { userId_postcode: { userId, postcode } },
        });
        return { action: 'removed' as const };
      }

      const count = await tx.userFavoritePostcode.count({
        where: { userId },
      });
      if (count >= MAX_FAVORITES) {
        throw new BadRequestException('Maximum favorites limit reached');
      }

      try {
        await tx.userFavoritePostcode.create({
          data: { userId, postcode },
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          return { action: 'added' as const };
        }
        throw error;
      }
      return { action: 'added' as const };
    });
  }

  async getUserFavorites(userId: string): Promise<FavoritePostcodeResponse[]> {
    const favorites = await this.prisma.userFavoritePostcode.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return favorites.map((f) => ({
      postcode: f.postcode,
      createdAt: formatTimestamp(f.createdAt),
    }));
  }

  async isFavorite(userId: string, postcode: string): Promise<boolean> {
    const favorite = await this.prisma.userFavoritePostcode.findUnique({
      where: { userId_postcode: { userId, postcode } },
    });
    return !!favorite;
  }
}
