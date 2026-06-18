import { PartialType } from '@nestjs/mapped-types';
import { CreateGammeOperationDto } from './create-gamme-operation.dto';

export class UpdateGammeOperationDto extends PartialType(
  CreateGammeOperationDto,
) {}