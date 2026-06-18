import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsNumber,
} from 'class-validator';

export class CreateHistoriqueDeclenchementPreventifDto {
  @IsInt()
  idPlanPreventifDeclencheur!: number;

  @IsOptional()
  @IsInt()
  idIntervention?: number;

  @IsOptional()
  @IsInt()
  idMateriel?: number;

  @IsOptional()
  @IsInt()
  idPointStructure?: number;

  @IsOptional()
  @IsString()
  dateDeclenchement?: string;

  @IsOptional()
  @IsString()
  conditionResume?: string;

  @IsOptional()
  @IsNumber()
  valeurRealisation?: number;

  @IsOptional()
  @IsBoolean()
  fictif?: boolean;

  @IsOptional()
  @IsString()
  statut?: string;
}