import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { VisasService } from './visas.service';
import { VisaOverviewService } from './visa-overview.service';
import {
  CurrentUser,
  type JwtPayload,
} from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  createVisaSchema,
  updateVisaSchema,
  type CreateVisaInput,
  type UpdateVisaInput,
} from '@regranted/shared';

@Controller('visas')
export class VisasController {
  constructor(
    private visasService: VisasService,
    private visaOverviewService: VisaOverviewService,
  ) {}

  @Get()
  async findAll(@CurrentUser() user: JwtPayload) {
    return this.visasService.findAll(user.sub);
  }

  @Get(':id/weekly-progress')
  async getWeeklyProgress(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.visasService.getWeeklyProgress(user.sub, id);
  }

  @Get(':id/overview')
  async getOverview(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.visaOverviewService.getOverview(user.sub, id);
  }

  @Get(':type')
  async findByType(
    @CurrentUser() user: JwtPayload,
    @Param('type') type: string,
  ) {
    return this.visasService.findByType(user.sub, type);
  }

  @Post()
  async create(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(createVisaSchema)) body: CreateVisaInput,
  ) {
    return this.visasService.create(user.sub, body);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateVisaSchema)) body: UpdateVisaInput,
  ) {
    return this.visasService.update(user.sub, id, body);
  }

  @Delete(':id')
  async remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.visasService.remove(user.sub, id);
  }
}
