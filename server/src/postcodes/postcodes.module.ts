import { Module } from '@nestjs/common';
import { PostcodesController } from './postcodes.controller';
import { PostcodesService } from './postcodes.service';

@Module({
  controllers: [PostcodesController],
  providers: [PostcodesService],
  exports: [PostcodesService],
})
export class PostcodesModule {}
