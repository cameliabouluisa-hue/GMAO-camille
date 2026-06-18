import { IsInt, IsOptional, IsString } from 'class-validator';

export class AffecterTechnicienDto {
  @IsInt()
  idTechnicien!: number;

  @IsOptional()
  @IsInt()
  tempsTravail?: number;

  @IsOptional()
  @IsString()
  affectePar?: string;
}