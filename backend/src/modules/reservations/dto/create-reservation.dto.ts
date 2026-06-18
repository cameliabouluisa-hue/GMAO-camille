import { Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateReservationDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  idArticle!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  idMagasin!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantite!: number;

  @IsOptional()
  @IsString()
  demandeur?: string;

  @IsOptional()
  @IsString()
  origineType?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  origineId?: number;

  @IsOptional()
  @IsString()
  commentaire?: string;
}