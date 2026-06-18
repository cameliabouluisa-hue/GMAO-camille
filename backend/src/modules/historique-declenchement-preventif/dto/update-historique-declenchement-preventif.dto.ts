import { PartialType } from '@nestjs/mapped-types';
import { CreateHistoriqueDeclenchementPreventifDto } from './create-historique-declenchement-preventif.dto';

export class UpdateHistoriqueDeclenchementPreventifDto extends PartialType(
  CreateHistoriqueDeclenchementPreventifDto,
) {}