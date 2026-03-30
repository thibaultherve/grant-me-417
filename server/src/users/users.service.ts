import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { User } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  UpdateProfileInput,
  UserProfile as UserProfileResponse,
} from '@regranted/shared';
import { getVisaTypeForNationality } from '@regranted/shared';
import { formatTimestamp } from '../common/utils/format.js';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string): Promise<UserProfileResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.mapToResponse(user);
  }

  async updateProfile(
    userId: string,
    input: UpdateProfileInput,
  ): Promise<UserProfileResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Derive whvType when nationality changes
    const nationalityData =
      input.nationality !== undefined
        ? {
            nationality: input.nationality,
            whvType: getVisaTypeForNationality(input.nationality),
            ukCitizenExemption: input.nationality === 'GB',
          }
        : {};

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.firstName !== undefined && { firstName: input.firstName }),
        ...nationalityData,
      },
    });

    return this.mapToResponse(updated);
  }

  private mapToResponse(user: User): UserProfileResponse {
    if (!user.nationality || !user.whvType) {
      throw new BadRequestException(
        'Profile incomplete: nationality is required. Please update your profile.',
      );
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName ?? '',
      nationality: user.nationality as UserProfileResponse['nationality'],
      whvType: user.whvType as '417' | '462',
      ukCitizenExemption: user.ukCitizenExemption ?? false,
      createdAt: formatTimestamp(user.createdAt),
      updatedAt: formatTimestamp(user.updatedAt),
    };
  }
}
