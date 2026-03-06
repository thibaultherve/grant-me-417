import { Module } from '@nestjs/common';
import { ChangelogsController } from './changelogs.controller.js';
import { ChangelogsService } from './changelogs.service.js';

@Module({
  controllers: [ChangelogsController],
  providers: [ChangelogsService],
})
export class ChangelogsModule {}
