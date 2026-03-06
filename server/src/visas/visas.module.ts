import { Module } from '@nestjs/common';
import { VisasController } from './visas.controller.js';
import { VisasService } from './visas.service.js';
import { VisaProgressService } from './visa-progress.service.js';

@Module({
  controllers: [VisasController],
  providers: [VisasService, VisaProgressService],
  exports: [VisaProgressService],
})
export class VisasModule {}
