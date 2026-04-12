import { Module } from '@nestjs/common';
import { VisasModule } from '../visas/visas.module';
import { WorkEntriesController } from './work-entries.controller';
import { WorkEntriesService } from './work-entries.service';

@Module({
  imports: [VisasModule],
  controllers: [WorkEntriesController],
  providers: [WorkEntriesService],
  exports: [WorkEntriesService],
})
export class WorkEntriesModule {}
