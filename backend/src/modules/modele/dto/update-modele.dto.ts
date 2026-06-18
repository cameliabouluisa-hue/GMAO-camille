import { PartialType } from '@nestjs/mapped-types';
import { CreateModeleDto } from './create-modele.dto';

export class UpdateModeleDto extends PartialType(CreateModeleDto) {}