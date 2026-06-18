import { IsOptional, IsString } from 'class-validator';

export class FournituresDisponiblesDto {
  @IsOptional()
  @IsString()
  changedBy?: string;

  @IsOptional()
  @IsString()
  commentaire?: string;
}