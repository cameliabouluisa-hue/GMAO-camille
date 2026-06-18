import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateModeleDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  libelle?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  idFamille?: number | null;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  idEtat!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  idTypeEquipement?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  idFabricant?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  idMarque?: number | null;

  @IsOptional()
  @IsString()
  commentaire?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  dureeVie?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  budget?: number | null;
  @IsOptional()
  
  @Type(() => Number)
  @IsInt({ each: true })
  pppIds?: number[];

@IsOptional()
@Type(() => Number)
@IsInt()
pppPrincipalId?: number | null;
}