import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateEtatModeleDto {
  @IsInt()
  idEtat: number;

  @IsString()
  @IsNotEmpty()
  libelle: string;
}