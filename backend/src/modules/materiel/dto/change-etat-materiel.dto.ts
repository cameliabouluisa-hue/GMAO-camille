import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class ChangeEtatMaterielDto {
  @Type(() => Number)
  @IsInt()
  idEtat!: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  motif?: string;
}