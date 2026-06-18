import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePointMesureDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  libelle?: string;

  @IsOptional()
  @IsString()
  @IsIn(['COMPTEUR', 'CONDITIONNEL'])
  type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  unite?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  organisation?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idPointStructure?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idMateriel?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  valeurMin?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  valeurMax?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  nbDecimales?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  periodeReleveJours?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  surveillanceMin?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  surveillanceMax?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  correctionMin?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  correctionMax?: number | null;

  @IsOptional()
  @IsBoolean()
  emettreDi?: boolean;

  @IsOptional()
  @IsBoolean()
  envoyerAlerte?: boolean;

  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}