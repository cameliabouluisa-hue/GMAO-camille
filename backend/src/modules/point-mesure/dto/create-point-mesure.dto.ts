import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePointMesureDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  libelle!: string;

  @IsString()
  @IsIn(['COMPTEUR', 'CONDITIONNEL'])
  type!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  unite?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  organisation?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idPointStructure?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idMateriel?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  valeurMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  valeurMax?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  nbDecimales?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  periodeReleveJours?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  surveillanceMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  surveillanceMax?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  correctionMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  correctionMax?: number;

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