import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreatePlanPreventifPredefiniDto {
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
  @MaxLength(50)
  etat?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  organisation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  typeDeclenchement?: string;

  @IsOptional()
  @IsInt()
  idModele?: number;

  @IsOptional()
  @IsInt()
  idGamme?: number;

  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}