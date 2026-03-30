import type { AuthUser, RegisterInput } from '@regranted/shared';
import { getVisaTypeForNationality } from '@regranted/shared';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(input: RegisterInput) {
    const existing = await this.prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const saltRounds = parseInt(
      this.configService.get('BCRYPT_SALT_ROUNDS', '10'),
      10,
    );
    const passwordHash = await bcrypt.hash(input.password, saltRounds);

    const whvType = getVisaTypeForNationality(input.nationality);

    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        nationality: input.nationality,
        whvType,
        ukCitizenExemption: input.nationality === 'GB',
      },
    });

    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user: this.toAuthUser(user),
      tokens,
    };
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<AuthUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    return this.toAuthUser(user);
  }

  async login(user: AuthUser) {
    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user,
      tokens,
    };
  }

  async refreshTokens(refreshToken: string) {
    const tokenHash = await this.hashToken(refreshToken);

    const storedToken = await this.prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Rotate: delete old token, generate new pair
    await this.prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });

    const tokens = await this.generateTokens(
      storedToken.user.id,
      storedToken.user.email,
    );

    return {
      user: this.toAuthUser(storedToken.user),
      tokens,
    };
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      const tokenHash = await this.hashToken(refreshToken);
      await this.prisma.refreshToken.deleteMany({
        where: { userId, tokenHash },
      });
    } else {
      // Revoke all refresh tokens for user
      await this.prisma.refreshToken.deleteMany({
        where: { userId },
      });
    }
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = randomBytes(32).toString('hex');
    const tokenHash = await this.hashToken(refreshToken);
    const expiresAt = new Date();
    const refreshTokenExpiryDays = this.configService.get<number>(
      'REFRESH_TOKEN_EXPIRY_DAYS',
      7,
    );
    expiresAt.setDate(expiresAt.getDate() + refreshTokenExpiryDays);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  private async hashToken(token: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  private toAuthUser(user: {
    id: string;
    email: string;
    firstName: string | null;
  }): AuthUser {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName ?? '',
    };
  }
}
