import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateUniteArticleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  libelle: string;
}