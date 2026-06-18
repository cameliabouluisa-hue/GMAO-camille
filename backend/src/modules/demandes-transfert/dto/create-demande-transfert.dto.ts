import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateLigneDemandeTransfertDto {
  @Type(() => Number)
  @IsInt()
  idArticle!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  quantite!: number;

  @IsOptional()
  @IsString()
  commentaire?: string;
}

export class CreateDemandeTransfertDto {
  @Type(() => Number)
  @IsInt()
  idMagasinSource!: number;

  @Type(() => Number)
  @IsInt()
  idMagasinDestination!: number;

  @IsOptional()
  @IsString()
  demandeur?: string;

  @IsOptional()
  @IsString()
  commentaire?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateLigneDemandeTransfertDto)
  lignes!: CreateLigneDemandeTransfertDto[];
}