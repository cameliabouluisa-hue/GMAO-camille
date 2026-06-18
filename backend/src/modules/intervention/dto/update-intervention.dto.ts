import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateInterventionDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  libelle?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  typeMaintenance?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  typeIntervention?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  natureIntervention?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  priorite?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  criticite?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  centreCout?: string;

  /**
   * Champs legacy utilisés encore dans ton service actuel
   */
  @IsOptional()
  @IsDateString()
  dateDebut?: string;

  @IsOptional()
  @IsDateString()
  dateFin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  etat?: string;

  /**
   * Liens
   */
  @IsOptional()
  @IsInt()
  idMateriel?: number;

  @IsOptional()
  @IsInt()
  idPointStructure?: number;

  @IsOptional()
  @IsInt()
  idDemande?: number;

  @IsOptional()
  @IsInt()
  idGamme?: number;

  @IsOptional()
  @IsInt()
  idEquipe?: number;

  /**
   * Dates prévues / réelles
   */
  @IsOptional()
  @IsDateString()
  dateDebutPrevue?: string;

  @IsOptional()
  @IsDateString()
  dateFinPrevue?: string;

  @IsOptional()
  @IsDateString()
  dateDebutReelle?: string;

  @IsOptional()
  @IsDateString()
  dateFinReelle?: string;

  @IsOptional()
  @IsDateString()
  dateSouhaiteeFin?: string;

  @IsOptional()
  @IsBoolean()
  dateFixe?: boolean;

  @IsOptional()
  @IsBoolean()
  aPlanifier?: boolean;

  /**
   * État matériel
   */
  @IsOptional()
  @IsBoolean()
  materielEnPanne?: boolean;

  @IsOptional()
  @IsBoolean()
  materielIndisponible?: boolean;

  @IsOptional()
  @IsBoolean()
  arretMateriel?: boolean;

  @IsOptional()
  @IsBoolean()
  arretProduction?: boolean;

  /**
   * Réception travaux
   */
  @IsOptional()
  @IsBoolean()
  receptionTravaux?: boolean;

  /**
   * Diagnostic
   */
  @IsOptional()
  @IsString()
  @MaxLength(150)
  symptome?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  cause?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  remede?: string;

  @IsOptional()
  @IsString()
  diagnosticInitial?: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  /**
   * Charges / durées
   */
  @IsOptional()
  @IsNumber()
  chargePrevue?: number;

  @IsOptional()
  @IsNumber()
  chargeRevisee?: number;

  @IsOptional()
  @IsNumber()
  chargeReelle?: number;

  @IsOptional()
  @IsNumber()
  tempsArretPrevu?: number;

  @IsOptional()
  @IsNumber()
  tempsArretReel?: number;
}