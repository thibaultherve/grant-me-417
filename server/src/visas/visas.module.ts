import { Module } from '@nestjs/common';
import { VisasController } from './visas.controller.js';
import { VisasService } from './visas.service.js';
import { VisaProgressService } from './visa-progress.service.js';
import { VisaOverviewService } from './visa-overview.service.js';

@Module({
  controllers: [VisasController],
  providers: [VisasService, VisaProgressService, VisaOverviewService],
  exports: [VisaProgressService],
})
export class VisasModule {}
