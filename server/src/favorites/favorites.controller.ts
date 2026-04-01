import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  type JwtPayload,
} from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  toggleFavoritePostcodeSchema,
  type ToggleFavoritePostcodeInput,
} from '@regranted/shared';

@Controller('user/favorites/postcodes')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Post()
  @Throttle({ default: { ttl: 60000, limit: 20 } })
  async toggle(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(toggleFavoritePostcodeSchema))
    body: ToggleFavoritePostcodeInput,
  ) {
    return this.favoritesService.toggle(user.sub, body.postcode);
  }

  @Get()
  async getUserFavorites(@CurrentUser() user: JwtPayload) {
    return this.favoritesService.getUserFavorites(user.sub);
  }
}
