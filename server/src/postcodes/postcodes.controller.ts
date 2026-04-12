import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { PostcodesService } from './postcodes.service';
import {
  visaTypeQuerySchema,
  paginatedDirectoryQuerySchema,
  globalChangesQuerySchema,
  changeDetailParamSchema,
  changeDetailQuerySchema,
  lastUpdateQuerySchema,
  postcodeParamSchema,
  searchQuerySchema,
  suburbIdParamSchema,
  type PaginatedDirectoryQuery,
  type GlobalChangesQuery,
  type ChangeDetailParam,
  type ChangeDetailQuery,
} from '@regranted/shared';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  CurrentUser,
  type JwtPayload,
} from '../common/decorators/current-user.decorator';

@Controller()
export class PostcodesController {
  constructor(private postcodesService: PostcodesService) {}

  @Get('postcodes/search')
  async searchPostcodes(
    @Query(new ZodValidationPipe(searchQuerySchema)) query: { q: string },
  ) {
    return this.postcodesService.searchPostcodes(query.q);
  }

  @Get('postcodes/directory')
  async getPaginatedDirectory(
    @Query(new ZodValidationPipe(paginatedDirectoryQuerySchema))
    query: PaginatedDirectoryQuery,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.postcodesService.getPaginatedDirectory(query, user.sub);
  }

  @Get('postcodes/changes')
  async getGlobalChanges(
    @Query(new ZodValidationPipe(globalChangesQuerySchema))
    query: GlobalChangesQuery,
  ) {
    return this.postcodesService.getGlobalChanges(
      query.visaType,
      query.page,
      query.limit,
    );
  }

  @Get('postcodes/changes/:date')
  async getChangeDetail(
    @Param(new ZodValidationPipe(changeDetailParamSchema))
    params: ChangeDetailParam,
    @Query(new ZodValidationPipe(changeDetailQuerySchema))
    query: ChangeDetailQuery,
  ) {
    return this.postcodesService.getChangeDetail(params.date, query.visaType);
  }

  @Get('postcodes/last-update')
  async getLastUpdate(
    @Query(new ZodValidationPipe(lastUpdateQuerySchema))
    query: {
      visaType: string;
    },
  ) {
    return this.postcodesService.getLastUpdateInfo(query.visaType);
  }

  @Get('postcodes/:postcode/history')
  async getPostcodeHistory(
    @Param(new ZodValidationPipe(postcodeParamSchema))
    params: { postcode: string },
    @Query(new ZodValidationPipe(visaTypeQuerySchema))
    query: { visaType: '417' | '462' },
  ) {
    return this.postcodesService.getPostcodeHistory(
      params.postcode,
      query.visaType,
    );
  }

  @Get('postcodes/:postcode')
  async getPostcodeDetail(
    @Param(new ZodValidationPipe(postcodeParamSchema))
    params: {
      postcode: string;
    },
  ) {
    return this.postcodesService.getPostcodeDetail(params.postcode);
  }

  @Get('suburbs/search')
  async searchSuburbs(
    @Query(new ZodValidationPipe(searchQuerySchema)) query: { q: string },
  ) {
    return this.postcodesService.searchSuburbs(query.q);
  }

  @Get('suburbs/:id')
  async getSuburbById(
    @Param(new ZodValidationPipe(suburbIdParamSchema)) params: { id: number },
  ) {
    const suburb = await this.postcodesService.getSuburbById(params.id);
    if (!suburb) {
      throw new NotFoundException('Suburb not found');
    }
    return suburb;
  }
}
