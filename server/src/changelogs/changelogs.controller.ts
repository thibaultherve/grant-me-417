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
    return this.changelogsService.findAll(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
    );
  }
}
