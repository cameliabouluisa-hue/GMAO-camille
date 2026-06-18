import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePlanPreventifDeclencheurDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idPppDeclencheurSource?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  priorite?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  etat?: string;

  @IsOptional()
  @IsString()
  @IsIn(['CALENDAIRE', 'COMPTEUR', 'CONDITIONNEL'])
  typeDeclencheur?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idGamme?: number;

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
  @IsInt()
  idPointMesure?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idModele?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idFamille?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  etatInterventionCible?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  actualisation?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  horizonJours?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  toleranceJours?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  periodiciteValeur?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  periodiciteUnite?: string;

  @IsOptional()
  @IsDateString()
  prochainLancementDate?: string;

  @IsOptional()
  @IsDateString()
  derniereRealisationDate?: string;

  @IsOptional()
  @IsDateString()
  derniereRealisationPrevueDate?: string;

  @IsOptional()
  @IsString()
  @IsIn(['>=', '<=', '>', '<', '='])
  operateur?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  seuilValeur?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  prochainLancementValeur?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  derniereRealisationValeur?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  derniereRealisationPrevueValeur?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  symptomeCode?: string;

  @IsOptional()
  @IsDateString()
  saisonnaliteDu?: string;

  @IsOptional()
  @IsDateString()
  saisonnaliteAu?: string;

  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}