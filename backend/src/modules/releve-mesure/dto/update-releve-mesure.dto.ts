import { PartialType } from '@nestjs/mapped-types';
import { CreateReleveMesureDto } from './create-releve-mesure.dto';

export class UpdateReleveMesureDto extends PartialType(
  CreateReleveMesureDto,
) {}