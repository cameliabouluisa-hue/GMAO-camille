import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

function ToNumber() {
  return Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) {
      return value;
    }

    return Number(value);
  });
}

function ToNullableNumber() {
  return Transform(({ value }) => {
    if (value === '' || value === undefined) {
      return null;
    }

    if (value === null) {
      return null;
    }

    return Number(value);
  });
}

export class UpdateLigneSortieStockDto {
  @ToNumber()
  @IsOptional()
  @IsInt()
  @Min(1)
  idArticle?: number;

  @ToNumber()
  @IsOptional()
  @IsInt()
  @Min(1)
  idMagasin?: number;

  @ToNullableNumber()
  @IsOptional()
  @IsInt()
  @Min(1)
  idEmplacement?: number | null;

  @ToNumber()
  @IsOptional()
  @IsNumber()
  @Min(0.000001)
  quantite?: number;

  // IMPORTANT aussi ici pour la modification
  @ToNullableNumber()
  @IsOptional()
  @IsNumber()
  @Min(0)
  prixUnitaire?: number | null;

  @IsOptional()
  @IsString()
  commentaire?: string | null;

 
}