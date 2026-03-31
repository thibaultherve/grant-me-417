import {
  BadRequestException,
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { WorkEntriesService } from './work-entries.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import {
  CurrentUser,
  type JwtPayload,
} from '../common/decorators/current-user.decorator.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { saveWeekBatchSchema, type SaveWeekBatch } from '@regranted/shared';

@Controller('work-entries')
@UseGuards(JwtAuthGuard)
export class WorkEntriesController {
  constructor(private workEntriesService: WorkEntriesService) {}

  @Get()
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortField') sortField?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    const VALID_SORT_FIELDS = [
      'workDate',
      'hours',
      'employerName',
      'industry',
      'isEligible',
    ];
    const VALID_SORT_ORDERS = ['asc', 'desc'] as const;

    const safePage = Math.max(1, page ? parseInt(page, 10) : 1);
    const safeLimit = Math.min(
      100,
      Math.max(1, limit ? parseInt(limit, 10) : 10),
    );
    const safeSortField =
      sortField && VALID_SORT_FIELDS.includes(sortField)
        ? sortField
        : undefined;
    const safeSortOrder =
      sortOrder && VALID_SORT_ORDERS.includes(sortOrder as 'asc' | 'desc')
        ? (sortOrder as 'asc' | 'desc')
        : undefined;

    return this.workEntriesService.findAll(user.sub, {
      page: safePage,
      limit: safeLimit,
      sortField: safeSortField,
      sortOrder: safeSortOrder,
    });
  }

  @Get('week')
  async getWeekEntries(
    @CurrentUser() user: JwtPayload,
    @Query('weekStart') weekStart: string,
  ) {
    if (!weekStart || !/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) {
      throw new BadRequestException(
        'weekStart query param must be a valid ISO date (YYYY-MM-DD)',
      );
    }
    return this.workEntriesService.getWeekEntries(user.sub, weekStart);
  }

  @Put('week')
  async saveWeekBatch(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(saveWeekBatchSchema)) body: SaveWeekBatch,
  ) {
    return this.workEntriesService.saveWeekBatch(user.sub, body);
  }

  @Get('month/:year/:month/weekly')
  async getWeeklyHours(
    @CurrentUser() user: JwtPayload,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
  ) {
    if (year < 2000 || year > 2100) {
      throw new BadRequestException('year must be between 2000 and 2100');
    }
    if (month < 1 || month > 12) {
      throw new BadRequestException('month must be between 1 and 12');
    }
    return this.workEntriesService.getWeeklyHours(user.sub, year, month);
  }

  @Get('month/:year/:month')
  async getMonthHours(
    @CurrentUser() user: JwtPayload,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
  ) {
    if (year < 2000 || year > 2100) {
      throw new BadRequestException('year must be between 2000 and 2100');
    }
    if (month < 1 || month > 12) {
      throw new BadRequestException('month must be between 1 and 12');
    }
    return this.workEntriesService.getMonthHours(user.sub, year, month);
  }
}
