import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateOperationInterventionDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  ordre?: number;

  @IsOptional()
  @IsString()
  libelle?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  tempsPasse?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  obligatoire?: boolean;
}