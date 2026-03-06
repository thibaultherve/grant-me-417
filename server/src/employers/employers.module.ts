import { Module } from '@nestjs/common';
import { EmployersController } from './employers.controller.js';
import { EmployersService } from './employers.service.js';
import { VisasModule } from '../visas/visas.module.js';

@Module({
  imports: [VisasModule],
  controllers: [EmployersController],
  providers: [EmployersService],
  exports: [EmployersService],
})
export class EmployersModule {}
