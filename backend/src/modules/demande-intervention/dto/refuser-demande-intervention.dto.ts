import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RefuserDemandeInterventionDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  validatedBy?: string;

  @IsOptional()
  @IsString()
  motifRefus?: string;
}