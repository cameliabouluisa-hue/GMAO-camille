import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateGammeDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  libelle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  typeMaintenance?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  etat?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  organisation?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idModele?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idMateriel?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  jourFin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  chargePrevue?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  tempsArret?: number;

  @IsOptional()
  @IsBoolean()
  receptionTravaux?: boolean;

  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}