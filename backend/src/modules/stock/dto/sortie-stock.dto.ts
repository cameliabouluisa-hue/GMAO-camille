import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class LigneSortieStockDto {
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  idArticle!: number;

  @IsInt()
  @IsPositive()
  @Type(() => Number)
  idMagasin!: number;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  quantite!: number;

  @IsOptional()
  @IsString()
  commentaire?: string;
}

export class SortieStockDto {
  @IsOptional()
  @IsString()
  numero?: string;

  @IsOptional()
  @IsDateString()
  dateSortie?: string;

  @IsOptional()
  @IsString()
  commentaire?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LigneSortieStockDto)
  lignes!: LigneSortieStockDto[];
}