import { Module } from '@nestjs/common';
import { WorkEntriesController } from './work-entries.controller.js';
import { WorkEntriesService } from './work-entries.service.js';
import { VisasModule } from '../visas/visas.module.js';

@Module({
  imports: [VisasModule],
  controllers: [WorkEntriesController],
  providers: [WorkEntriesService],
  exports: [WorkEntriesService],
})
export class WorkEntriesModule {}
