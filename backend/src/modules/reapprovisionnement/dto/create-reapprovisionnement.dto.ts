import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateLigneReapprovisionnementDto {
  @Type(() => Number)
  @IsInt()
  idArticle!: number;

  @Type(() => Number)
  @Min(0.01)
  quantiteDemandee!: number;

  @IsOptional()
  @IsString()
  commentaire?: string;
}

export class CreateReapprovisionnementDto {
  @Type(() => Number)
  @IsInt()
  idMagasin!: number;

  @IsOptional()
  @IsString()
  demandeur?: string;

  @IsOptional()
  @IsString()
  commentaire?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateLigneReapprovisionnementDto)
  lignes!: CreateLigneReapprovisionnementDto[];
}