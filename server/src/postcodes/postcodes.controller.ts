import { Controller, Get, NotFoundException, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { PostcodesService } from './postcodes.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { postcodeDirectoryQuerySchema, postcodeParamSchema, type PostcodeDirectoryQuery } from '@regranted/shared';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';

const visaTypeQuerySchema = postcodeDirectoryQuerySchema.pick({ visaType: true });

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

  @Get('postcodes/directory')
  async getDirectory(
    @Query(new ZodValidationPipe(postcodeDirectoryQuerySchema)) query: PostcodeDirectoryQuery,
  ) {
    return this.postcodesService.getDirectory(query.visaType, query.date);
  }

  @Get('postcodes/:postcode/history')
  async getPostcodeHistory(
    @Param(new ZodValidationPipe(postcodeParamSchema)) params: { postcode: string },
    @Query(new ZodValidationPipe(visaTypeQuerySchema)) query: { visaType: '417' | '462' },
  ) {
    return this.postcodesService.getPostcodeHistory(params.postcode, query.visaType);
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
