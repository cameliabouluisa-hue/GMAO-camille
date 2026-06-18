import { PartialType } from '@nestjs/mapped-types';
import { CreatePlanPreventifPredefiniDto } from './create-plan-preventif-predefini.dto';

export class UpdatePlanPreventifPredefiniDto extends PartialType(
  CreatePlanPreventifPredefiniDto,
) {}