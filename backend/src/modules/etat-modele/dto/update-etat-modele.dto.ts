import { PartialType } from '@nestjs/mapped-types';
import { CreateEtatModeleDto } from './create-etat-modele.dto';

export class UpdateEtatModeleDto extends PartialType(CreateEtatModeleDto) {}