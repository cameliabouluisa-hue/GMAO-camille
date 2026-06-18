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

export class LigneInventaireDirectDto {
  @Type(() => Number)
  @IsInt()
  idArticle!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  quantiteReelle!: number;
}

export class ValiderInventaireDto {
  @Type(() => Number)
  @IsInt()
  idMagasin!: number;

  @IsOptional()
  @IsString()
  commentaire?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LigneInventaireDirectDto)
  lignes!: LigneInventaireDirectDto[];
}