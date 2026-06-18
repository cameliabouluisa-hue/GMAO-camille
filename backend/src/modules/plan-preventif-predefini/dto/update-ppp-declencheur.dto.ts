import { PartialType } from '@nestjs/mapped-types';
import { CreatePppDeclencheurDto } from './create-ppp-declencheur.dto';

export class UpdatePppDeclencheurDto extends PartialType(
  CreatePppDeclencheurDto,
) {}