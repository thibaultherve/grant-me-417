import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ChangelogsService } from './changelogs.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('changelogs')
@UseGuards(JwtAuthGuard)
export class ChangelogsController {
  constructor(private changelogsService: ChangelogsService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const safePage = Math.max(1, page ? parseInt(page, 10) : 1);
    const safeLimit = Math.min(100, Math.max(1, limit ? parseInt(limit, 10) : 10));
    return this.changelogsService.findAll(safePage, safeLimit);
  }
}
