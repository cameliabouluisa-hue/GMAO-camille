import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMaterielDto {
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
  @MaxLength(100)
  numeroSerie?: string;

  // Cycle de vie
  @IsOptional()
  @IsDateString()
  dateMiseService?: string;

  @IsOptional()
  @IsDateString()
  dateDernierInventaire?: string;

  @IsOptional()
  @IsDateString()
  dateRebut?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  motifRebut?: string;

  // true : inventaire géré par le module stock
  // false : l'admin peut modifier manuellement l'inventaire
  @IsOptional()
  @IsBoolean()
  gereEnStock?: boolean;

  // EN_STOCK, SUR_TERRAIN, EN_ATELIER, AU_REBUT
  @IsOptional()
  @IsString()
  @MaxLength(30)
  positionActuelle?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idModele?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idEtat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idType?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idPointStructure?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idMaterielParent?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idLigneEntreeStock?: number;

  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}