import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  UpdateProfileInput,
  UserProfile as UserProfileResponse,
} from '@regranted/shared';
import { formatTimestamp } from '../common/utils/format.js';

const USER_INCLUDE = { profile: true } as const;

type UserWithProfile = Prisma.UserGetPayload<{
  include: typeof USER_INCLUDE;
}>;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string): Promise<UserProfileResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: USER_INCLUDE,
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
      include: USER_INCLUDE,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { firstName, lastName, ...profileFields } = input;

    const hasUserFields = firstName !== undefined || lastName !== undefined;
    const hasProfileFields = Object.keys(profileFields).length > 0;

    await this.prisma.$transaction(async (tx) => {
      if (hasUserFields) {
        await tx.user.update({
          where: { id: userId },
          data: {
            ...(firstName !== undefined && { firstName }),
            ...(lastName !== undefined && { lastName }),
          },
        });
      }

      if (hasProfileFields) {
        await tx.userProfile.update({
          where: { userId },
          data: {
            ...(profileFields.nationality !== undefined && {
              nationality: profileFields.nationality,
            }),
            ...(profileFields.ukCitizenExemption !== undefined && {
              ukCitizenExemption: profileFields.ukCitizenExemption,
            }),
          },
        });
      }
    });

    return this.getProfile(userId);
  }

  private mapToResponse(user: UserWithProfile): UserProfileResponse {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      nationality: user.profile?.nationality ?? null,
      ukCitizenExemption: user.profile?.ukCitizenExemption ?? false,
      createdAt: formatTimestamp(user.createdAt),
      updatedAt: formatTimestamp(user.profile?.updatedAt ?? user.updatedAt),
    };
  }
}
