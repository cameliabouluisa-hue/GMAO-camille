import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCycleVieMaterielDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idEtat?: number;

  @IsOptional()
  @IsDateString()
  dateDernierInventaire?: string;

  @IsOptional()
  @IsDateString()
  dateMiseService?: string;

  @IsOptional()
  @IsDateString()
  dateRebut?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  motifRebut?: string;
}