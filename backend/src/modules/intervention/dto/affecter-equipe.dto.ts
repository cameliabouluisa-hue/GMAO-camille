import { IsInt, IsOptional, IsString } from 'class-validator';

export class AffecterEquipeDto {
  @IsInt()
  idEquipe!: number;

  @IsOptional()
  @IsString()
  assignedBy?: string;
}