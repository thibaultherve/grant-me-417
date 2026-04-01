import { Module } from '@nestjs/common';
import { VisaOverviewService } from './visa-overview.service';
import { VisaProgressService } from './visa-progress.service';
import { VisasController } from './visas.controller';
import { VisasService } from './visas.service';

@Module({
  controllers: [VisasController],
  providers: [VisasService, VisaProgressService, VisaOverviewService],
  exports: [VisaProgressService],
})
export class VisasModule {}
