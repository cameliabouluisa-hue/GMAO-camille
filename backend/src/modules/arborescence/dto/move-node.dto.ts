import {
  IsIn,
  IsInt,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MoveNodeDto {
  @IsIn(['GEOGRAPHIQUE', 'TECHNIQUE', 'MATERIEL'])
  typeArborescence!: 'GEOGRAPHIQUE' | 'TECHNIQUE' | 'MATERIEL';

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

  @IsIn(['POINT_STRUCTURE', 'MATERIEL'])
  nouveauParentType!: 'POINT_STRUCTURE' | 'MATERIEL';

  @ValidateIf((o) => o.nouveauParentType === 'POINT_STRUCTURE')
  @Type(() => Number)
  @IsInt()
  nouveauParentPointId?: number;

  @ValidateIf((o) => o.nouveauParentType === 'MATERIEL')
  @Type(() => Number)
  @IsInt()
  nouveauParentMaterielId?: number;
}