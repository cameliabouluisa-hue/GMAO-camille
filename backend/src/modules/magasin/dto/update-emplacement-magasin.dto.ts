import { PartialType } from '@nestjs/mapped-types';
import { CreateEmplacementMagasinDto } from './create-emplacement-magasin.dto';

export class UpdateEmplacementMagasinDto extends PartialType(
  CreateEmplacementMagasinDto,
) {}