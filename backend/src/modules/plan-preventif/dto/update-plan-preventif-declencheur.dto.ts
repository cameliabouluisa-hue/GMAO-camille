import { PartialType } from '@nestjs/mapped-types';
import { CreatePlanPreventifDeclencheurDto } from './create-plan-preventif-declencheur.dto';

export class UpdatePlanPreventifDeclencheurDto extends PartialType(
  CreatePlanPreventifDeclencheurDto,
) {}