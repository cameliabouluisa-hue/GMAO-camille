import { PartialType } from '@nestjs/mapped-types';
import { CreatePointStructureDto } from './create-points-structure.dto';

export class UpdatePointStructureDto extends PartialType(
  CreatePointStructureDto,
) {}