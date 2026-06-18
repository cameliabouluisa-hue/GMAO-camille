import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class GenerateOtCorrectiveDto {
  @IsOptional()
  @IsInt()
  idGamme?: number;

  @IsOptional()
  @IsInt()
  idEquipe?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  createdBy?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  assignedBy?: string;
}