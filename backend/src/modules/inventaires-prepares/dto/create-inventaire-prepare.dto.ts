import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateInventairePrepareDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  idMagasin!: number;

  @IsOptional()
  @IsString()
  commentaire?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === true) return true;
    if (value === 'true') return true;
    if (value === 1) return true;
    if (value === '1') return true;
    return false;
  })
  @IsBoolean()
  genererDepuisStock?: boolean;
}