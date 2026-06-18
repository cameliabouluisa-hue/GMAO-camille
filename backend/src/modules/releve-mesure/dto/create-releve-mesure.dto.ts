import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReleveMesureDto {
  @Type(() => Number)
  @IsInt()
  idPointMesure!: number;

  @IsOptional()
  @IsDateString()
  dateReleve?: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  valeur!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  variation?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  commentaire?: string | null;

  @IsOptional()
  @IsBoolean()
  correction?: boolean;
}