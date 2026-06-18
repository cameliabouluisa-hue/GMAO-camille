import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreatePlanPreventifDto {
  @IsString()
  @MaxLength(50)
  code!: string;

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
  @MaxLength(30)
  typeDeclenchement?: string;

  @IsOptional()
  @IsInt()
  idMateriel?: number;

  @IsOptional()
  @IsInt()
  idPointStructure?: number;

  @IsOptional()
  @IsInt()
  idPlanPreventifPredefiniSource?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  organisation?: string;

  @IsOptional()
  @IsBoolean()
  masquerLignesInactives?: boolean;

  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}