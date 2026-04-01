import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { EmployersService } from './employers.service';
import {
  CurrentUser,
  type JwtPayload,
} from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  createEmployerSchema,
  updateEmployerSchema,
  checkEligibilityInputSchema,
  type CreateEmployerInput,
  type UpdateEmployerInput,
  type CheckEligibilityInput,
} from '@regranted/shared';

@Controller('employers')
export class EmployersController {
  constructor(private employersService: EmployersService) {}

  @Get()
  async findAll(@CurrentUser() user: JwtPayload) {
    return this.employersService.findAll(user.sub);
  }

  @Get(':id')
  async findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.employersService.findOne(user.sub, id);
  }

  @Post('eligibilityCheck')
  async checkEligibility(
    @Body(new ZodValidationPipe(checkEligibilityInputSchema))
    body: CheckEligibilityInput,
  ) {
    return this.employersService.checkEligibility(
      body.suburbId,
      body.industry,
      body.visaType,
    );
  }

  @Post()
  async create(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(createEmployerSchema))
    body: CreateEmployerInput,
  ) {
    return this.employersService.create(user.sub, body);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateEmployerSchema))
    body: UpdateEmployerInput,
  ) {
    return this.employersService.update(user.sub, id, body);
  }

  @Delete(':id')
  async remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.employersService.remove(user.sub, id);
  }
}
