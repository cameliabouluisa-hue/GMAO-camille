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

export class CreatePppDeclencheurDto {
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
  idModele?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idPointMesure?: number;

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
  @Type(() => Number)
  @IsInt()
  nombreJoursPremierLancement?: number;

  @IsOptional()
  @IsString()
  @IsIn(['>=', '<=', '>', '<', '='])
  operateur?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  seuilValeur?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  symptomeCode?: string;

  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}