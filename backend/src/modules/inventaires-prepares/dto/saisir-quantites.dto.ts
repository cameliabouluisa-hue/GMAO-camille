// src/modules/inventaires-prepares/dto/saisir-quantites.dto.ts

import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class SaisirLigneQuantiteDto {
  @Type(() => Number)
  @IsInt()
  idLigneInventairePrepare!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  quantiteReelle!: number;

  @IsOptional()
  @IsString()
  commentaire?: string;
}

export class SaisirQuantitesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaisirLigneQuantiteDto)
  lignes!: SaisirLigneQuantiteDto[];
}