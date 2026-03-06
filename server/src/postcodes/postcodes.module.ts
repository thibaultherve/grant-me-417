import { Module } from '@nestjs/common';
import { PostcodesController } from './postcodes.controller.js';
import { PostcodesService } from './postcodes.service.js';

@Module({
  controllers: [PostcodesController],
  providers: [PostcodesService],
  exports: [PostcodesService],
})
export class PostcodesModule {}
