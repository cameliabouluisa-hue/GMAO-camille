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

export class LigneSortieStockCrudDto {
  @ToNumber()
  @IsInt()
  @Min(1)
  idArticle?: number;

  @ToNumber()
  @IsInt()
  @Min(1)
  idMagasin?: number;

  @ToNullableNumber()
  @IsOptional()
  @IsInt()
  @Min(1)
  idEmplacement?: number | null;

  @ToNumber()
  @IsNumber()
  @Min(0.000001)
  quantite?: number;

  // IMPORTANT : ce champ enlève l'erreur
  // "property prixUnitaire should not exist"
  @ToNullableNumber()
  @IsOptional()
  @IsNumber()
  @Min(0)
  prixUnitaire?: number | null;

  @IsOptional()
  @IsString()
  commentaire?: string | null;
}