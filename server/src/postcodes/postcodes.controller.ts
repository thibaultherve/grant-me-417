import { Controller, Get, NotFoundException, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { PostcodesService } from './postcodes.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller()
@UseGuards(JwtAuthGuard)
export class PostcodesController {
  constructor(private postcodesService: PostcodesService) {}

  @Get('postcodes/search')
  async searchPostcodes(
    @Query('q') query: string = '',
  ) {
    return this.postcodesService.searchPostcodes(query);
  }

  @Get('suburbs/search')
  async searchSuburbs(
    @Query('q') query: string = '',
  ) {
    return this.postcodesService.searchSuburbs(query);
  }

  @Get('suburbs/:id')
  async getSuburbById(@Param('id', ParseIntPipe) id: number) {
    const suburb = await this.postcodesService.getSuburbById(id);
    if (!suburb) {
      throw new NotFoundException('Suburb not found');
    }
    return suburb;
  }
}
