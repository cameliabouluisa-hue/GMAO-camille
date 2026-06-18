import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MaterielEntreeStockDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsOptional()
  @IsString()
  numeroSerie?: string;
}

export class LigneEntreeStockDto {
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  idArticle!: number;

  @IsInt()
  @IsPositive()
  @Type(() => Number)
  idMagasin!: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  idEmplacement?: number;

  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  quantite!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  prixUnitaire?: number;

  @IsOptional()
  @IsString()
  numeroLot?: string;

  @IsOptional()
  @IsDateString()
  datePeremption?: string;

  @IsOptional()
  @IsString()
  commentaire?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaterielEntreeStockDto)
  materiels?: MaterielEntreeStockDto[];
}

export class EntreeStockDto {
  @IsOptional()
  @IsString()
  numero?: string;

  @IsOptional()
  @IsDateString()
  dateReception?: string;

  @IsOptional()
  @IsString()
  commentaire?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LigneEntreeStockDto)
  lignes!: LigneEntreeStockDto[];
}

export class UpdateEntreeStockDto {
  @IsOptional()
  @IsString()
  numero?: string;

  @IsOptional()
  @IsDateString()
  dateReception?: string;

  @IsOptional()
  @IsString()
  commentaire?: string;
}

export class UpdateLigneEntreeStockDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  idArticle?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  idMagasin?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  idEmplacement?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  quantite?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  prixUnitaire?: number;

  @IsOptional()
  @IsString()
  numeroLot?: string;

  @IsOptional()
  @IsDateString()
  datePeremption?: string;

  @IsOptional()
  @IsString()
  commentaire?: string;
    @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaterielEntreeStockDto)
  materiels?: MaterielEntreeStockDto[];
}