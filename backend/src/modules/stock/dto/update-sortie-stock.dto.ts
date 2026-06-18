import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateSortieStockDto {
  @IsOptional()
  @IsString()
  numero?: string;

  @IsOptional()
  @IsDateString()
  dateSortie?: string;

  @IsOptional()
  @IsString()
  commentaire?: string;
}