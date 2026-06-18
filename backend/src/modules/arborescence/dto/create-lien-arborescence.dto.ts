import {
  IsIn,
  IsInt,
  IsOptional,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLienArborescenceDto {
  @IsIn(['GEOGRAPHIQUE', 'TECHNIQUE', 'MATERIEL'])
  typeArborescence!: 'GEOGRAPHIQUE' | 'TECHNIQUE' | 'MATERIEL';

  @IsIn(['POINT_STRUCTURE', 'MATERIEL'])
  parentType!: 'POINT_STRUCTURE' | 'MATERIEL';

  @ValidateIf((o) => o.parentType === 'POINT_STRUCTURE')
  @Type(() => Number)
  @IsInt()
  parentPointId?: number;

  @ValidateIf((o) => o.parentType === 'MATERIEL')
  @Type(() => Number)
  @IsInt()
  parentMaterielId?: number;

  @IsIn(['POINT_STRUCTURE', 'MATERIEL'])
  enfantType!: 'POINT_STRUCTURE' | 'MATERIEL';

  @ValidateIf((o) => o.enfantType === 'POINT_STRUCTURE')
  @Type(() => Number)
  @IsInt()
  enfantPointId?: number;

  @ValidateIf((o) => o.enfantType === 'MATERIEL')
  @Type(() => Number)
  @IsInt()
  enfantMaterielId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  ordre?: number;
}