import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ValiderDemandeInterventionDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  validatedBy?: string;
}