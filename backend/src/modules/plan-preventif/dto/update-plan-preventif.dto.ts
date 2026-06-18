import { PartialType } from '@nestjs/mapped-types';
import { CreatePlanPreventifDto } from './create-plan-preventif.dto';

export class UpdatePlanPreventifDto extends PartialType(
  CreatePlanPreventifDto,
) {}