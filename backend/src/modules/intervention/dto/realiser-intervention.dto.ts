import { IsOptional, IsString } from 'class-validator';

export class RealiserInterventionDto {
  @IsOptional()
  @IsString()
  dateFin?: string;

  @IsOptional()
  @IsString()
  commentaire?: string;
}