import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '../../../generated/prisma/client';

import { CreateOccupationInterventionDto } from './dto/create-occupation-intervention.dto';
import { CreateInterventionDto } from './dto/create-intervention.dto';
import { UpdateInterventionDto } from './dto/update-intervention.dto';
import { UpsertCompteRenduInterventionDto } from './dto/upsert-compte-rendu-intervention.dto';
import { CreateOperationInterventionDto } from './dto/create-operation-intervention.dto';
import { FournituresDisponiblesDto } from './dto/fournitures-disponibles.dto';
import {
  AffecterEquipeDto,
  AffecterTechnicienDto,
  ChangementEtatDto,
  DemarrerInterventionDto,
  RefuserTravauxDto,
  ReporterInterventionDto,
  TerminerInterventionDto,
} from './dto/action-intervention.dto';

import { INTERVENTION_ETATS } from './intervention.constants';

type FindAllFilters = {
  etat?: string;
  typeMaintenance?: string;
  idMateriel?: number;
  idEquipe?: number;
};

const interventionInclude = {
  materiel: true,
  point_structure: true,
  demande_intervention: true,
  gamme: true,
  equipe_maintenance: true,
  plan_preventif: true,
  plan_preventif_declencheur: true,

  affectation_technicien: {
    include: {
      technicien: true,
    },
  },

  operation_intervention: true,

  consommations: {
    include: {
      article: true,
      magasin: true,
      sortieStockLigne: {
        include: {
          sortieStock: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  },

  occupations: {
    include: {
      technicien: true,
      operation: true,
    },
    orderBy: {
      dateOccupation: 'desc',
    },
  },

  sortieStocks: {
    include: {
      lignes: {
        include: {
          article: true,
          magasin: true,
          emplacement: true,
          materiel: true,
        },
      },
    },
    orderBy: {
      idSortieStock: 'desc',
    },
  },

  compteRendu: true,

  historiquesEtat: {
    orderBy: {
      changedAt: 'desc',
    },
  },
} satisfies Prisma.interventionInclude;

@Injectable()
export class InterventionService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: FindAllFilters = {}) {
    const where: Prisma.interventionWhereInput = {};

    if (filters.etat) where.etat = filters.etat;
    if (filters.typeMaintenance) where.typeMaintenance = filters.typeMaintenance;
    if (filters.idMateriel) where.idMateriel = filters.idMateriel;
    if (filters.idEquipe) where.idEquipe = filters.idEquipe;

    return this.prisma.intervention.findMany({
      where,
      include: interventionInclude,
      orderBy: {
        idIntervention: 'desc',
      },
    });
  }
async getOperations(idIntervention: number) {
  const intervention = await this.prisma.intervention.findUnique({
    where: { idIntervention },
    select: { idIntervention: true },
  });

  if (!intervention) {
    throw new NotFoundException('Intervention introuvable.');
  }

  return this.prisma.operation_intervention.findMany({
    where: { idIntervention },
    orderBy: [{ ordre: 'asc' }, { idOperation: 'asc' }],
  });
}

async createOperation(
  idIntervention: number,
  dto: CreateOperationInterventionDto,
) {
  const intervention = await this.prisma.intervention.findUnique({
    where: { idIntervention },
    select: {
      idIntervention: true,
      etat: true,
    },
  });

  if (!intervention) {
    throw new NotFoundException('Intervention introuvable.');
  }

  const etat = (intervention.etat || '').toUpperCase();

  if (['SOLDE', 'ARCHIVE', 'ANNULE'].includes(etat)) {
    throw new BadRequestException(
      "Impossible d'ajouter une opération sur une intervention soldée, archivée ou annulée.",
    );
  }

  if (!dto.libelle?.trim()) {
    throw new BadRequestException('Le libellé de l’opération est obligatoire.');
  }

  return this.prisma.operation_intervention.create({
    data: {
      idIntervention,
      ordre: dto.ordre,
      libelle: dto.libelle.trim(),
      description: dto.description?.trim() || null,
      tempsPasse: dto.tempsPasse,
      obligatoire: dto.obligatoire ?? false,
    },
  });
}
async fournituresDisponibles(
  idIntervention: number,
  dto: FournituresDisponiblesDto,
) {
  const intervention = await this.prisma.intervention.findUnique({
    where: { idIntervention },
    select: {
      idIntervention: true,
      etat: true,
    },
  });

  if (!intervention) {
    throw new NotFoundException('Intervention introuvable.');
  }

  if (intervention.etat !== 'ATTENTE_FOURNITURE') {
    throw new BadRequestException(
      "L'intervention doit être en attente fourniture.",
    );
  }

  const ancienEtat = intervention.etat;
  const nouvelEtat = 'ATTENTE_REALISATION';

  await this.prisma.$transaction(async (tx) => {
    await tx.intervention.update({
      where: { idIntervention },
      data: {
        etat: nouvelEtat,
        updatedAt: new Date(),
      },
    });

    await tx.historique_etat_intervention.create({
      data: {
        idIntervention,
        ancienEtat,
        nouvelEtat,
        action: 'FOURNITURES_DISPONIBLES',
        changedBy: dto.changedBy || 'Admin',
        commentaire:
          dto.commentaire ||
          "Les fournitures sont disponibles, l'OT est prêt à être réalisé.",
      },
    });
  });

  return this.findOne(idIntervention);
}
async deleteOperation(idIntervention: number, idOperation: number) {
  const operation = await this.prisma.operation_intervention.findUnique({
    where: { idOperation },
  });

  if (!operation || operation.idIntervention !== idIntervention) {
    throw new NotFoundException('Opération introuvable pour cette intervention.');
  }

  const intervention = await this.prisma.intervention.findUnique({
    where: { idIntervention },
    select: { etat: true },
  });

  const etat = (intervention?.etat || '').toUpperCase();

  if (['SOLDE', 'ARCHIVE', 'ANNULE'].includes(etat)) {
    throw new BadRequestException(
      "Impossible de supprimer une opération sur une intervention soldée, archivée ou annulée.",
    );
  }

  await this.prisma.operation_intervention.delete({
    where: { idOperation },
  });

  return this.findOne(idIntervention);
}
  async findOne(idIntervention: number) {
    let intervention = await this.prisma.intervention.findUnique({
      where: { idIntervention },
      include: interventionInclude,
    });

    if (!intervention) {
      throw new NotFoundException('Intervention introuvable.');
    }

    if (
      intervention.idGamme &&
      intervention.operation_intervention.length === 0
    ) {
      await this.prisma.$transaction(async (tx) => {
        await this.syncOperationsFromGammeTx(tx, {
          idIntervention,
          idGamme: intervention!.idGamme!,
        });
      });

      intervention = await this.prisma.intervention.findUnique({
        where: { idIntervention },
        include: interventionInclude,
      });
    }

    if (!intervention) {
      throw new NotFoundException('Intervention introuvable.');
    }

    return intervention;
  }

  async findByType(typeMaintenance: string) {
    return this.prisma.intervention.findMany({
      where: { typeMaintenance },
      include: interventionInclude,
      orderBy: { idIntervention: 'desc' },
    });
  }

  async findByEtat(etat: string) {
    return this.prisma.intervention.findMany({
      where: { etat },
      include: interventionInclude,
      orderBy: { idIntervention: 'desc' },
    });
  }

  async findEquipesMaintenance() {
    return this.prisma.equipe_maintenance.findMany({
      where: {
        actif: true,
      },
      orderBy: [{ code: 'asc' }, { idEquipe: 'asc' }],
    });
  }

  async findTechniciens() {
    return this.prisma.technicien.findMany({
      orderBy: [{ nom: 'asc' }, { matricule: 'asc' }, { idTechnicien: 'asc' }],
      include: {
        equipe_maintenance: true,
      },
    });
  }

  async create(dto: CreateInterventionDto) {
    if (dto.idMateriel) {
      await this.ensureMaterielExists(dto.idMateriel);
    }

    if (dto.idDemande) {
      await this.ensureDemandeExists(dto.idDemande);
    }

    if (dto.idEquipe) {
      await this.ensureEquipeExists(dto.idEquipe);
    }

    const code =
      dto.code ?? (await this.generateInterventionCode(dto.typeMaintenance));

    const data: Prisma.interventionCreateInput = {
      code,
      libelle: dto.libelle,
      description: dto.description,
      typeMaintenance: dto.typeMaintenance,
      typeIntervention: dto.typeIntervention,
      natureIntervention: dto.natureIntervention,
      priorite: dto.priorite ?? 'NORMALE',
      criticite: dto.criticite ?? 'MOYENNE',
      centreCout: dto.centreCout,
      etat: INTERVENTION_ETATS.EN_PREPARATION,
      origineGeneration: dto.idDemande ? 'DI' : 'DIRECTE',

      dateDebutPrevue: this.parseDate(dto.dateDebutPrevue),
      dateFinPrevue: this.parseDate(dto.dateFinPrevue),
      dateSouhaiteeFin: this.parseDate(dto.dateSouhaiteeFin),

      dateFixe: dto.dateFixe ?? false,
      aPlanifier: dto.aPlanifier ?? false,

      materielEnPanne: dto.materielEnPanne ?? false,
      materielIndisponible: dto.materielIndisponible ?? false,
      arretMateriel: dto.arretMateriel ?? false,

      receptionTravaux: dto.receptionTravaux ?? false,

      symptome: dto.symptome,
      cause: dto.cause,
      remede: dto.remede,
      diagnosticInitial: dto.diagnosticInitial,
      instructions: dto.instructions,

      chargePrevue: dto.chargePrevue,
      tempsArretPrevu: dto.tempsArretPrevu,

      createdBy: dto.createdBy,

      materiel: dto.idMateriel
        ? { connect: { idMateriel: dto.idMateriel } }
        : undefined,

      point_structure: dto.idPointStructure
        ? { connect: { idPoint: dto.idPointStructure } }
        : undefined,

      demande_intervention: dto.idDemande
        ? { connect: { idDemande: dto.idDemande } }
        : undefined,

      gamme: dto.idGamme ? { connect: { idGamme: dto.idGamme } } : undefined,

      equipe_maintenance: dto.idEquipe
        ? { connect: { idEquipe: dto.idEquipe } }
        : undefined,

      plan_preventif: dto.idPlanPreventif
        ? { connect: { idPlanPreventif: dto.idPlanPreventif } }
        : undefined,

      plan_preventif_declencheur: dto.idPlanPreventifDeclencheur
        ? {
            connect: {
              idPlanPreventifDeclencheur: dto.idPlanPreventifDeclencheur,
            },
          }
        : undefined,
    };

    return this.prisma.$transaction(async (tx) => {
      const intervention = await tx.intervention.create({
        data,
      });

      if (intervention.idGamme) {
        await this.syncOperationsFromGammeTx(tx, {
          idIntervention: intervention.idIntervention,
          idGamme: intervention.idGamme,
        });
      }

      await this.createHistoriqueEtatTx(tx, {
        idIntervention: intervention.idIntervention,
        ancienEtat: null,
        nouvelEtat: INTERVENTION_ETATS.EN_PREPARATION,
        action: 'CREATION',
        commentaire: 'Création de l’intervention',
        changedBy: dto.createdBy,
      });

      return tx.intervention.findUnique({
        where: { idIntervention: intervention.idIntervention },
        include: interventionInclude,
      });
    });
  }

  async update(idIntervention: number, dto: UpdateInterventionDto) {
    const intervention = await this.findOne(idIntervention);

    this.ensureModifiable(intervention.etat);

    if (dto.idMateriel) {
      await this.ensureMaterielExists(dto.idMateriel);
    }

    if (dto.idDemande) {
      await this.ensureDemandeExists(dto.idDemande);
    }

    if (dto.idEquipe) {
      await this.ensureEquipeExists(dto.idEquipe);
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.intervention.update({
        where: { idIntervention },
        data: {
          code: dto.code,
          libelle: dto.libelle,
          description: dto.description,
          typeMaintenance: dto.typeMaintenance,
          typeIntervention: dto.typeIntervention,
          natureIntervention: dto.natureIntervention,
          priorite: dto.priorite,
          criticite: dto.criticite,
          centreCout: dto.centreCout,

          idMateriel: dto.idMateriel,
          idPointStructure: dto.idPointStructure,
          idDemande: dto.idDemande,
          idGamme: dto.idGamme,
          idEquipe: dto.idEquipe,

          dateDebutPrevue: this.parseDate(dto.dateDebutPrevue),
          dateFinPrevue: this.parseDate(dto.dateFinPrevue),
          dateDebutReelle: this.parseDate(dto.dateDebutReelle),
          dateFinReelle: this.parseDate(dto.dateFinReelle),
          dateSouhaiteeFin: this.parseDate(dto.dateSouhaiteeFin),

          dateFixe: dto.dateFixe,
          aPlanifier: dto.aPlanifier,

          materielEnPanne: dto.materielEnPanne,
          materielIndisponible: dto.materielIndisponible,
          arretMateriel: dto.arretMateriel,
          receptionTravaux: dto.receptionTravaux,

          symptome: dto.symptome,
          cause: dto.cause,
          remede: dto.remede,
          diagnosticInitial: dto.diagnosticInitial,
          instructions: dto.instructions,

          chargePrevue: dto.chargePrevue,
          chargeRevisee: dto.chargeRevisee,
          chargeReelle: dto.chargeReelle,
          tempsArretPrevu: dto.tempsArretPrevu,
          tempsArretReel: dto.tempsArretReel,
        },
      });

      if (updated.idGamme) {
        await this.syncOperationsFromGammeTx(tx, {
          idIntervention,
          idGamme: updated.idGamme,
        });
      }

      return tx.intervention.findUnique({
        where: { idIntervention },
        include: interventionInclude,
      });
    });
  }

  async delete(idIntervention: number) {
    const intervention = await this.findOne(idIntervention);

    if (
      intervention.etat !== INTERVENTION_ETATS.EN_PREPARATION &&
      intervention.etat !== INTERVENTION_ETATS.ATTENTE_DEVIS
    ) {
      throw new BadRequestException(
        'Suppression impossible. Seules les interventions en préparation ou en attente devis peuvent être supprimées.',
      );
    }

    return this.prisma.intervention.delete({
      where: { idIntervention },
    });
  }

  async affecterEquipe(
  idIntervention: number,
  dto: { idEquipe: number; assignedBy?: string },
) {
  const intervention = await this.prisma.intervention.findUnique({
    where: { idIntervention },
    select: {
      idIntervention: true,
      idEquipe: true,
      etat: true,
    },
  });

  if (!intervention) {
    throw new NotFoundException('Intervention introuvable.');
  }

  this.assertCanManageAffectations(intervention.etat);

  const equipe = await this.prisma.equipe_maintenance.findUnique({
    where: { idEquipe: dto.idEquipe },
  });

  if (!equipe) {
    throw new NotFoundException('Équipe introuvable.');
  }

  const equipeChangee =
    intervention.idEquipe !== null &&
    intervention.idEquipe !== dto.idEquipe;

  await this.prisma.$transaction(async (tx) => {
    if (equipeChangee) {
      await tx.affectation_technicien.deleteMany({
        where: { idIntervention },
      });
    }

    await tx.intervention.update({
      where: { idIntervention },
      data: {
        idEquipe: dto.idEquipe,
        assignedBy: dto.assignedBy ?? 'Admin',
        dateAffectation: new Date(),
      },
    });
  });

  return this.findOne(idIntervention);
}

  async affecterTechnicien(
    idIntervention: number,
    dto: AffecterTechnicienDto,
  ) {
    const intervention = await this.findOne(idIntervention);
    this.ensureModifiable(intervention.etat);

    await this.ensureTechnicienExists(dto.idTechnicien);

    return this.prisma.affectation_technicien.create({
      data: {
        idIntervention,
        idTechnicien: dto.idTechnicien,
        tempsTravail: dto.tempsTravail,
        affectePar: dto.affectePar,
        dateAffectation: new Date(),
      },
      include: {
        technicien: true,
        intervention: true,
      },
    });
  }
  async deleteAffectationTechnicien(
  idIntervention: number,
  idAffectation: number,
) {
  const affectation = await this.prisma.affectation_technicien.findUnique({
    where: { idAffectation },
  });

  if (!affectation || affectation.idIntervention !== idIntervention) {
    throw new NotFoundException(
      'Affectation technicien introuvable pour cette intervention.',
    );
  }

const intervention = await this.prisma.intervention.findUnique({
  where: { idIntervention },
  select: { etat: true },
});

if (!intervention) {
  throw new NotFoundException('Intervention introuvable.');
}

this.assertCanManageAffectations(intervention.etat);

  await this.prisma.affectation_technicien.delete({
    where: { idAffectation },
  });

  return this.findOne(idIntervention);
}

  async retirerAffectation(idAffectation: number) {
    const affectation = await this.prisma.affectation_technicien.findUnique({
      where: { idAffectation },
    });

    if (!affectation) {
      throw new NotFoundException('Affectation introuvable.');
    }

    return this.prisma.affectation_technicien.delete({
      where: { idAffectation },
    });
  }

  async getCompteRendu(idIntervention: number) {
    await this.findOne(idIntervention);

    const compteRendu =
      await this.prisma.compte_rendu_intervention.findUnique({
        where: { idIntervention },
      });

    if (!compteRendu) {
      throw new NotFoundException(
        'Aucun compte-rendu trouvé pour cette intervention.',
      );
    }

    return compteRendu;
  }

  async upsertCompteRendu(
    idIntervention: number,
    dto: UpsertCompteRenduInterventionDto,
  ) {
    const intervention = await this.findOne(idIntervention);

    this.ensureCompteRenduWritable(intervention.etat);

    const dateCompteRendu =
      this.parseDate(dto.dateCompteRendu) ?? new Date();

    const tempsArret =
      dto.tempsArret !== undefined
        ? new Prisma.Decimal(dto.tempsArret)
        : undefined;

    const dureeReelle =
      dto.dureeReelle !== undefined
        ? new Prisma.Decimal(dto.dureeReelle)
        : undefined;

    return this.prisma.$transaction(async (tx) => {
      const compteRendu =
        await tx.compte_rendu_intervention.upsert({
          where: { idIntervention },
          create: {
            idIntervention,
            dateCompteRendu,
            saisiPar: dto.saisiPar,
            travauxEffectues: dto.travauxEffectues,
            diagnostic: dto.diagnostic,
            cause: dto.cause,
            remede: dto.remede,
            observation: dto.observation,
            resultat: dto.resultat,
            tempsArret,
            dureeReelle,
          },
          update: {
            dateCompteRendu,
            saisiPar: dto.saisiPar,
            travauxEffectues: dto.travauxEffectues,
            diagnostic: dto.diagnostic,
            cause: dto.cause,
            remede: dto.remede,
            observation: dto.observation,
            resultat: dto.resultat,
            tempsArret,
            dureeReelle,
          },
        });

      await tx.intervention.update({
        where: { idIntervention },
        data: {
          cause: dto.cause,
          remede: dto.remede,
          diagnosticInitial: dto.diagnostic,
          commentaireRealisation:
            dto.travauxEffectues ?? dto.observation,
          tempsArretReel: tempsArret,
          dureeReelle,
          chargeReelle: dureeReelle,
          reportedBy: dto.saisiPar,
        },
      });

      return compteRendu;
    });
  }

  async demanderValidation(
    idIntervention: number,
    dto: ChangementEtatDto,
  ) {
    return this.changeEtat(idIntervention, {
      nouvelEtat: INTERVENTION_ETATS.ATTENTE_VALIDATION,
      action: 'DEMANDE_VALIDATION',
      changedBy: dto.utilisateur,
      commentaire: dto.commentaire,
      allowedFrom: [
        INTERVENTION_ETATS.EN_PREPARATION,
      ],
      data: {},
      
    });
  }

  async valider(idIntervention: number, dto: ChangementEtatDto) {
    const intervention = await this.findOne(idIntervention);

    if (intervention.etat !== INTERVENTION_ETATS.ATTENTE_VALIDATION) {
      throw new BadRequestException(
        'Cette intervention ne peut pas être validée depuis son état actuel.',
      );
    }

    return this.changeEtat(idIntervention, {
      nouvelEtat: INTERVENTION_ETATS.VALIDEE,
      action: 'VALIDATION',
      changedBy: dto.utilisateur,
      commentaire: dto.commentaire,
      allowedFrom: [
        INTERVENTION_ETATS.ATTENTE_VALIDATION,
      ],
      data: {
        validatedBy: dto.utilisateur,
        dateValidation: new Date(),

        chargeRevisee: intervention.chargePrevue,
        chargeReviseeMoyens: intervention.chargePrevueMoyens,

        coutMainOeuvreRevise: intervention.coutMainOeuvrePrevu,
        coutPiecesRevise: intervention.coutPiecesPrevu,
        coutMoyensRevise: intervention.coutMoyensPrevu,
        coutSousTraitanceRevise: intervention.coutSousTraitancePrevu,
        coutTotalRevise: intervention.coutTotalPrevu,
      },
    });
  }

  async refuser(idIntervention: number, dto: ChangementEtatDto) {
    return this.changeEtat(idIntervention, {
      nouvelEtat: INTERVENTION_ETATS.ANNULE,
      action: 'REFUS_VALIDATION',
      changedBy: dto.utilisateur,
      commentaire: dto.commentaire,
      allowedFrom: [INTERVENTION_ETATS.ATTENTE_VALIDATION],
      data: {
        cancelledBy: dto.utilisateur,
        dateAnnulation: new Date(),
        motifAnnulation: dto.commentaire,
      },
    });
  }
async demarrer(idIntervention: number, dto: DemarrerInterventionDto) {
  return this.changeEtat(idIntervention, {
    nouvelEtat: INTERVENTION_ETATS.EN_COURS,
    action: 'DEMARRAGE',
    changedBy: dto.startedBy,
    commentaire: dto.commentaire,
    allowedFrom: [
      INTERVENTION_ETATS.VALIDEE,
      INTERVENTION_ETATS.ATTENTE_REALISATION,
    ],
    data: {
      startedBy: dto.startedBy,
        dateDebutReelle: this.parseDate(dto.dateDebutReelle) ?? new Date(),
      },
    });
  }

 async terminer(idIntervention: number, dto: TerminerInterventionDto) {
  return this.changeEtat(idIntervention, {
    nouvelEtat: INTERVENTION_ETATS.TERMINE,
    action: 'TERMINER',
    changedBy: dto.reportedBy,
    commentaire: dto.commentaire,
    allowedFrom: [INTERVENTION_ETATS.EN_COURS],
    data: {
      reportedBy: dto.reportedBy,
      dateFinReelle: this.parseDate(dto.dateFinReelle) ?? new Date(),
      dureeReelle: dto.dureeReelle,
      tempsArretReel: dto.tempsArretReel,
      chargeReelle: dto.dureeReelle,
    },
  });
}
private async solderDemandeLiee(idIntervention: number) {
  const intervention = await this.prisma.intervention.findUnique({
    where: { idIntervention },
    select: {
      idDemande: true,
    },
  });

  if (!intervention?.idDemande) {
    return;
  }

  await this.prisma.demande_intervention.updateMany({
    where: {
      idDemande: intervention.idDemande,
      statut: {
        notIn: ['REFUSE', 'SOLDE'],
      },
    },
    data: {
      statut: 'SOLDE',
      updatedAt: new Date(),
    },
  });
}
  async accepterTravaux(idIntervention: number, dto: ChangementEtatDto) {
    return this.changeEtat(idIntervention, {
      nouvelEtat: INTERVENTION_ETATS.TRAVAUX_ACCEPTES,
      action: 'ACCEPTER_TRAVAUX',
      changedBy: dto.utilisateur,
      commentaire: dto.commentaire,
      allowedFrom: [INTERVENTION_ETATS.TERMINE],
      data: {
        receptionBy: dto.utilisateur,
        dateReceptionTravaux: new Date(),
      },
    });
  }

  async refuserTravaux(idIntervention: number, dto: RefuserTravauxDto) {
    return this.changeEtat(idIntervention, {
      nouvelEtat: INTERVENTION_ETATS.TRAVAUX_REFUSES,
      action: 'REFUSER_TRAVAUX',
      changedBy: dto.utilisateur,
      commentaire: dto.motifRefusTravaux,
      allowedFrom: [INTERVENTION_ETATS.TERMINE],
      data: {
        motifRefusTravaux: dto.motifRefusTravaux,
      },
    });
  }

  async reprendre(idIntervention: number, dto: ChangementEtatDto) {
    return this.changeEtat(idIntervention, {
      nouvelEtat: INTERVENTION_ETATS.EN_COURS,
      action: 'REPRENDRE',
      changedBy: dto.utilisateur,
      commentaire: dto.commentaire,
      allowedFrom: [INTERVENTION_ETATS.TRAVAUX_REFUSES],
      data: {
        startedBy: dto.utilisateur,
        dateDebutReelle: new Date(),
      },
    });
  }

  async attenteFourniture(idIntervention: number, dto: ChangementEtatDto) {
    return this.changeEtat(idIntervention, {
      nouvelEtat: INTERVENTION_ETATS.ATTENTE_FOURNITURE,
      action: 'ATTENTE_FOURNITURE',
      changedBy: dto.utilisateur,
      commentaire: dto.commentaire,
      allowedFrom: [INTERVENTION_ETATS.VALIDEE],
      data: {},
    });
  }

async solder(idIntervention: number, dto: ChangementEtatDto) {
  const intervention = await this.findOne(idIntervention);

  if (intervention.etat !== INTERVENTION_ETATS.TRAVAUX_ACCEPTES) {
    throw new BadRequestException(
      'Cette intervention nécessite une réception des travaux avant solde.',
    );
  }

  return this.changeEtat(idIntervention, {
    nouvelEtat: INTERVENTION_ETATS.SOLDE,
    action: 'SOLDE',
    changedBy: dto.utilisateur,
    commentaire: dto.commentaire,
    allowedFrom: [INTERVENTION_ETATS.TRAVAUX_ACCEPTES],
    data: {
      dateCloture: new Date(),
      closedBy: dto.utilisateur,
    },
  });
}
  async annuler(idIntervention: number, dto: ChangementEtatDto) {
    const intervention = await this.findOne(idIntervention);

    if (
      ![
        INTERVENTION_ETATS.EN_PREPARATION,
        INTERVENTION_ETATS.ATTENTE_VALIDATION,
        INTERVENTION_ETATS.VALIDEE,
        INTERVENTION_ETATS.EN_COURS,
      ].includes(intervention.etat as any)
    ) {
      throw new BadRequestException('Annulation impossible depuis cet état.');
    }

    return this.changeEtat(idIntervention, {
      nouvelEtat: INTERVENTION_ETATS.ANNULE,
      action: 'ANNULATION',
      changedBy: dto.utilisateur,
      commentaire: dto.commentaire,
      allowedFrom: [
        INTERVENTION_ETATS.EN_PREPARATION,
        INTERVENTION_ETATS.ATTENTE_VALIDATION,
        INTERVENTION_ETATS.VALIDEE,
        INTERVENTION_ETATS.EN_COURS,
      ],
      data: {
        dateAnnulation: new Date(),
        cancelledBy: dto.utilisateur,
        motifAnnulation: dto.commentaire,
      },
    });
  }

  async archiver(idIntervention: number, dto: ChangementEtatDto) {
    return this.changeEtat(idIntervention, {
      nouvelEtat: INTERVENTION_ETATS.ARCHIVE,
      action: 'ARCHIVAGE',
      changedBy: dto.utilisateur,
      commentaire: dto.commentaire,
      allowedFrom: [INTERVENTION_ETATS.SOLDE],
      data: {
        dateArchivage: new Date(),
        archivedBy: dto.utilisateur,
      },
    });
  }

  async reporter(idIntervention: number, dto: ReporterInterventionDto) {
    const intervention = await this.findOne(idIntervention);
    this.ensureModifiable(intervention.etat);

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.intervention.update({
        where: { idIntervention },
        data: {
          dateDebutPrevue: this.parseDate(dto.nouvelleDateDebut),
          dateFinPrevue: this.parseDate(dto.nouvelleDateFin),
          dateReport: new Date(),
          motifReport: dto.motifReport,
          reportedBy: dto.reportedBy,
        },
      });

      await this.createHistoriqueEtatTx(tx, {
        idIntervention,
        ancienEtat: intervention.etat,
        nouvelEtat: intervention.etat ?? INTERVENTION_ETATS.EN_PREPARATION,
        action: 'REPORT',
        commentaire: dto.motifReport,
        changedBy: dto.reportedBy,
      });

      return tx.intervention.findUnique({
        where: { idIntervention: updated.idIntervention },
        include: interventionInclude,
      });
    });
  }

  async getOccupations(idIntervention: number) {
    await this.findOne(idIntervention);

    return this.prisma.occupation_intervention.findMany({
      where: {
        idIntervention,
      },
      include: {
        technicien: true,
        operation: true,
      },
      orderBy: {
        dateOccupation: 'desc',
      },
    });
  }

  async createOccupation(
    idIntervention: number,
    dto: CreateOccupationInterventionDto,
  ) {
    const intervention = await this.findOne(idIntervention);

    if (intervention.etat !== INTERVENTION_ETATS.EN_COURS) {
      throw new BadRequestException(
        'Une occupation ne peut être saisie que sur une intervention en cours.',
      );
    }

    if (dto.idTechnicien) {
      await this.ensureTechnicienExists(dto.idTechnicien);
    }

    if (dto.idOperation) {
      const operation = await this.prisma.operation_intervention.findUnique({
        where: { idOperation: dto.idOperation },
      });

      if (!operation) {
        throw new NotFoundException("Opération d'intervention introuvable.");
      }

      if (operation.idIntervention !== idIntervention) {
        throw new BadRequestException(
          "Cette opération n'appartient pas à cette intervention.",
        );
      }
    }

    const dateOccupation = this.parseDate(dto.dateOccupation);

    if (!dateOccupation) {
      throw new BadRequestException('La date occupation est obligatoire.');
    }

    return this.prisma.$transaction(async (tx) => {
      const occupation = await tx.occupation_intervention.create({
        data: {
          idIntervention,
          idTechnicien: dto.idTechnicien,
          idOperation: dto.idOperation,
          dateOccupation,
          duree: new Prisma.Decimal(dto.duree),
          natureOccupation: dto.natureOccupation,
          typeHoraire: dto.typeHoraire,
          commentaire: dto.commentaire,
          createdBy: dto.createdBy,
        },
        include: {
          technicien: true,
          operation: true,
        },
      });

      await this.recalculateOccupationTotalsTx(tx, idIntervention);

      return occupation;
    });
  }

  async deleteOccupation(idIntervention: number, idOccupation: number) {
    const intervention = await this.findOne(idIntervention);

    if (intervention.etat !== INTERVENTION_ETATS.EN_COURS) {
      throw new BadRequestException(
        'Une occupation ne peut être supprimée que sur une intervention en cours.',
      );
    }

    const occupation = await this.prisma.occupation_intervention.findUnique({
      where: {
        idOccupation,
      },
    });

    if (!occupation) {
      throw new NotFoundException('Occupation introuvable.');
    }

    if (occupation.idIntervention !== idIntervention) {
      throw new BadRequestException(
        'Cette occupation n’appartient pas à cette intervention.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.occupation_intervention.delete({
        where: {
          idOccupation,
        },
      });

      await this.recalculateOccupationTotalsTx(tx, idIntervention);

      return tx.intervention.findUnique({
        where: {
          idIntervention,
        },
        include: interventionInclude,
      });
    });
  }

  

 

  

  async dashboardResponsable() {
    const today = new Date();

    const [
      total,
      enPreparation,
      attenteValidation,
      attenteRealisation,
      enCours,
      terminees,
      soldees,
      annulees,
      enRetard,
    ] = await Promise.all([
      this.prisma.intervention.count(),
      this.prisma.intervention.count({
        where: { etat: INTERVENTION_ETATS.EN_PREPARATION },
      }),
      this.prisma.intervention.count({
        where: { etat: INTERVENTION_ETATS.ATTENTE_VALIDATION },
      }),
      this.prisma.intervention.count({
        where: { etat: INTERVENTION_ETATS.ATTENTE_REALISATION },
      }),
      this.prisma.intervention.count({
        where: { etat: INTERVENTION_ETATS.EN_COURS },
      }),
      this.prisma.intervention.count({
        where: { etat: INTERVENTION_ETATS.TERMINE },
      }),
      this.prisma.intervention.count({
        where: { etat: INTERVENTION_ETATS.SOLDE },
      }),
      this.prisma.intervention.count({
        where: { etat: INTERVENTION_ETATS.ANNULE },
      }),
      this.prisma.intervention.count({
        where: {
          dateFinPrevue: { lt: today },
          etat: {
            notIn: [
              INTERVENTION_ETATS.SOLDE,
              INTERVENTION_ETATS.ANNULE,
              INTERVENTION_ETATS.ARCHIVE,
            ],
          },
        },
      }),
    ]);

    return {
      total,
      enPreparation,
      attenteValidation,
      attenteRealisation,
      enCours,
      terminees,
      soldees,
      annulees,
      enRetard,
    };
  }

  async dashboardEquipe(idEquipe: number) {
    await this.ensureEquipeExists(idEquipe);

    const [total, enCours, attenteRealisation, terminees] = await Promise.all([
      this.prisma.intervention.count({ where: { idEquipe } }),
      this.prisma.intervention.count({
        where: { idEquipe, etat: INTERVENTION_ETATS.EN_COURS },
      }),
      this.prisma.intervention.count({
        where: { idEquipe, etat: INTERVENTION_ETATS.ATTENTE_REALISATION },
      }),
      this.prisma.intervention.count({
        where: { idEquipe, etat: INTERVENTION_ETATS.TERMINE },
      }),
    ]);

    return {
      idEquipe,
      total,
      enCours,
      attenteRealisation,
      terminees,
    };
  }

  async dashboardChefEquipe(idEquipe: number) {
    return this.dashboardEquipe(idEquipe);
  }

  async dashboardTechnicien(idTechnicien: number) {
    await this.ensureTechnicienExists(idTechnicien);

    const affectations = await this.prisma.affectation_technicien.findMany({
      where: { idTechnicien },
      include: {
        intervention: true,
      },
      orderBy: {
        idAffectation: 'desc',
      },
    });

    const total = affectations.length;
    const enCours = affectations.filter(
      (a) => a.intervention?.etat === INTERVENTION_ETATS.EN_COURS,
    ).length;
    const attenteRealisation = affectations.filter(
      (a) => a.intervention?.etat === INTERVENTION_ETATS.ATTENTE_REALISATION,
    ).length;
    const soldees = affectations.filter(
      (a) => a.intervention?.etat === INTERVENTION_ETATS.SOLDE,
    ).length;

    return {
      idTechnicien,
      total,
      enCours,
      attenteRealisation,
      soldees,
      affectations,
    };
  }

private async changeEtat(
  idIntervention: number,
  params: {
    nouvelEtat: string;
    action: string;
    changedBy?: string;
    commentaire?: string;
    allowedFrom: string[];
    data: Prisma.interventionUpdateInput;
  },
) {
  const intervention = await this.findOne(idIntervention);
  const ancienEtat = intervention.etat;

  if (!ancienEtat || !params.allowedFrom.includes(ancienEtat)) {
    throw new BadRequestException(
      `Transition impossible : ${ancienEtat} → ${params.nouvelEtat}`,
    );
  }

  if (
    ancienEtat === INTERVENTION_ETATS.ANNULE ||
    ancienEtat === INTERVENTION_ETATS.ARCHIVE
  ) {
    throw new BadRequestException(
      'Une intervention annulée ou archivée ne peut plus changer d’état.',
    );
  }

  return this.prisma.$transaction(async (tx) => {
    const updated = await tx.intervention.update({
      where: { idIntervention },
      data: {
        ...params.data,
        etat: params.nouvelEtat,
      },
    });

    await this.createHistoriqueEtatTx(tx, {
      idIntervention,
      ancienEtat,
      nouvelEtat: params.nouvelEtat,
      action: params.action,
      commentaire: params.commentaire,
      changedBy: params.changedBy,
    });

    /**
     * Cas important :
     * Quand l'OT passe à SOLDE, on solde d'abord la DI liée.
     * Ensuite seulement on recalcule l'état du matériel.
     */
    if (params.nouvelEtat === INTERVENTION_ETATS.SOLDE) {
      if (updated.idDemande) {
        await this.solderDemandeLieeTx(tx, {
          idDemande: updated.idDemande,
          changedBy: params.changedBy,
          commentaire:
            params.commentaire ?? 'Demande soldée depuis l’OT lié.',
        });
      }

      if (updated.idMateriel) {
        await this.recalculerEtatMaterielDepuisDemandesTx(
          tx,
          updated.idMateriel,
        );
      }
    }

    return tx.intervention.findUnique({
      where: { idIntervention: updated.idIntervention },
      include: interventionInclude,
    });
  });
}
 
private assertCanManageAffectations(etat?: string | null) {
  const currentEtat = (etat || '').toUpperCase();

  const allowedStates = [
    'EN_PREPARATION',
    'ATTENTE_VALIDATION',
    'VALIDEE',
    'ATTENTE_REALISATION',
    'ATTENTE_FOURNITURE',
  ];

  if (!allowedStates.includes(currentEtat)) {
    throw new BadRequestException(
      "Les affectations ne sont autorisées qu'avant le démarrage de l'OT.",
    );
  }
}
  private async synchroniserDemandeDepuisInterventionTermineeTx(
    tx: Prisma.TransactionClient,
    data: {
      idDemande: number;
      changedBy?: string;
      commentaire?: string;
    },
  ) {
    const demande = await tx.demande_intervention.findUnique({
      where: { idDemande: data.idDemande },
    });

    if (!demande) return;

    if (
      demande.statut === 'SOLDE' ||
      demande.statut === 'REFUSE' ||
      demande.statut === 'ANNULE'
    ) {
      return;
    }

    const nouveauStatut = 'TERMINE';

    await tx.demande_intervention.update({
      where: { idDemande: data.idDemande },
      data: {
        statut: nouveauStatut,
        dateReceptionTravaux: new Date(),
        receptionBy: data.changedBy,
      },
    });

    await tx.historique_etat_demande_intervention.create({
      data: {
        idDemande: data.idDemande,
        ancienStatut: demande.statut,
        nouveauStatut,
        action:
          nouveauStatut === 'TERMINE'
            ? 'INTERVENTION_TERMINEE'
            : 'INTERVENTION_SOLDEE',
        commentaire: data.commentaire,
        changedBy: data.changedBy,
        changedAt: new Date(),
      },
    });
  }
private async solderDemandeLieeTx(
  tx: Prisma.TransactionClient,
  data: {
    idDemande: number;
    changedBy?: string;
    commentaire?: string;
  },
) {
  const demande = await tx.demande_intervention.findUnique({
    where: {
      idDemande: data.idDemande,
    },
    select: {
      idDemande: true,
      statut: true,
    },
  });

  if (!demande) {
    return;
  }

  if (
    demande.statut === 'SOLDE' ||
    demande.statut === 'REFUSE' ||
    demande.statut === 'ANNULE'
  ) {
    return;
  }

  await tx.demande_intervention.update({
    where: {
      idDemande: data.idDemande,
    },
    data: {
      statut: 'SOLDE',
      updatedAt: new Date(),
    },
  });

  await tx.historique_etat_demande_intervention.create({
    data: {
      idDemande: data.idDemande,
      ancienStatut: demande.statut,
      nouveauStatut: 'SOLDE',
      action: 'SOLDE_AUTO_DEPUIS_OT',
      commentaire:
        data.commentaire ?? 'Demande soldée automatiquement depuis l’OT lié.',
      changedBy: data.changedBy,
      changedAt: new Date(),
    },
  });
}
  private async recalculateOccupationTotalsTx(
    tx: Prisma.TransactionClient,
    idIntervention: number,
  ) {
    const result = await tx.occupation_intervention.aggregate({
      where: {
        idIntervention,
      },
      _sum: {
        duree: true,
      },
    });

    const totalDuree = result._sum.duree ?? new Prisma.Decimal(0);

    await tx.intervention.update({
      where: {
        idIntervention,
      },
      data: {
        chargeReelle: totalDuree,
        dureeReelle: totalDuree,
      },
    });
  }

  private async syncOperationsFromGammeTx(
    tx: Prisma.TransactionClient,
    data: {
      idIntervention: number;
      idGamme: number;
    },
  ) {
    const existingCount = await tx.operation_intervention.count({
      where: {
        idIntervention: data.idIntervention,
      },
    });

    if (existingCount > 0) return;

    const operations = await tx.gamme_operation.findMany({
      where: {
        idGamme: data.idGamme,
      },
      orderBy: [{ ordre: 'asc' }, { idOperation: 'asc' }],
    });

    if (operations.length === 0) return;

    await tx.operation_intervention.createMany({
      data: operations.map((operation) => ({
        idIntervention: data.idIntervention,
        ordre: operation.ordre,
        libelle: operation.libelle,
        description: operation.description,
        idGammeOperationSource: operation.idOperation,
        obligatoire: operation.obligatoire ?? false,
      })),
    });
  }

 

  private resolvePrixUnitaireConsommation(
    prixDto: number | undefined,
    article: {
      prixUnitaire?: Prisma.Decimal | null;
      prixStandard?: Prisma.Decimal | null;
      prixMoyenPondere?: Prisma.Decimal | null;
    },
  ) {
    if (prixDto !== undefined) {
      return new Prisma.Decimal(prixDto);
    }

    if (
      article.prixMoyenPondere !== null &&
      article.prixMoyenPondere !== undefined
    ) {
      return new Prisma.Decimal(article.prixMoyenPondere);
    }

    if (article.prixStandard !== null && article.prixStandard !== undefined) {
      return new Prisma.Decimal(article.prixStandard);
    }

    if (article.prixUnitaire !== null && article.prixUnitaire !== undefined) {
      return new Prisma.Decimal(article.prixUnitaire);
    }

    return new Prisma.Decimal(0);
  }

  private async generateSortieStockNumeroTx(tx: Prisma.TransactionClient) {
    const count = await tx.sortie_stock.count();

    let index = count + 1;

    while (true) {
      const numero = `SOR-MNT-${String(index).padStart(6, '0')}`;

      const exists = await tx.sortie_stock.findUnique({
        where: {
          numero,
        },
      });

      if (!exists) return numero;

      index++;
    }
  }

  private decimalOrZero(
    value?: Prisma.Decimal | number | string | null,
  ) {
    if (value === null || value === undefined) {
      return new Prisma.Decimal(0);
    }

    return new Prisma.Decimal(value);
  }

  private async createHistoriqueEtatTx(
    tx: Prisma.TransactionClient,
    data: {
      idIntervention: number;
      ancienEtat?: string | null;
      nouvelEtat: string;
      action?: string;
      commentaire?: string;
      changedBy?: string;
    },
  ) {
    return tx.historique_etat_intervention.create({
      data: {
        idIntervention: data.idIntervention,
        ancienEtat: data.ancienEtat,
        nouvelEtat: data.nouvelEtat,
        action: data.action,
        commentaire: data.commentaire,
        changedBy: data.changedBy,
        changedAt: new Date(),
      },
    });
  }

  private parseDate(value?: string): Date | undefined {
    if (!value) return undefined;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`Date invalide : ${value}`);
    }

    return date;
  }

  private ensureModifiable(etat?: string | null) {
    if (
      etat === INTERVENTION_ETATS.SOLDE ||
      etat === INTERVENTION_ETATS.ANNULE ||
      etat === INTERVENTION_ETATS.ARCHIVE
    ) {
      throw new BadRequestException(
        'Cette intervention est soldée, annulée ou archivée. Modification impossible.',
      );
    }
  }

  private ensureCompteRenduWritable(etat?: string | null) {
    if (
      etat !== INTERVENTION_ETATS.EN_COURS &&
      etat !== INTERVENTION_ETATS.TERMINE
    ) {
      throw new BadRequestException(
        'Le compte-rendu ne peut être saisi que sur une intervention en cours ou terminée.',
      );
    }
  }

  private async ensureMaterielExists(idMateriel: number) {
    const materiel = await this.prisma.materiel.findUnique({
      where: { idMateriel },
    });

    if (!materiel) {
      throw new NotFoundException('Matériel introuvable.');
    }
  }

  private async ensureDemandeExists(idDemande: number) {
    const demande = await this.prisma.demande_intervention.findUnique({
      where: { idDemande },
    });

    if (!demande) {
      throw new NotFoundException('Demande d’intervention introuvable.');
    }
  }

  private async ensureEquipeExists(idEquipe: number) {
    const equipe = await this.prisma.equipe_maintenance.findUnique({
      where: { idEquipe },
    });

    if (!equipe) {
      throw new NotFoundException('Équipe de maintenance introuvable.');
    }
  }

  private async ensureTechnicienExists(idTechnicien: number) {
    const technicien = await this.prisma.technicien.findUnique({
      where: { idTechnicien },
    });

    if (!technicien) {
      throw new NotFoundException('Technicien introuvable.');
    }
  }
private async recalculerEtatMaterielDepuisDemandesTx(
  tx: Prisma.TransactionClient,
  idMateriel: number,
) {
  const demandesActives = await tx.demande_intervention.findMany({
    where: {
      idMateriel,
      statut: {
        notIn: ['SOLDE', 'SOLDEE', 'REFUSE', 'ANNULE'],
      },
    },
    select: {
      materielEnPanne: true,
      materielIndisponible: true,
    },
  });

  let codeEtatCible = 'EN_SERVICE';

  const existeIndisponible = demandesActives.some(
    (demande) => demande.materielIndisponible === true,
  );

  const existeEnPanne = demandesActives.some(
    (demande) => demande.materielEnPanne === true,
  );

  if (existeIndisponible) {
    codeEtatCible = 'INDISPONIBLE';
  } else if (existeEnPanne) {
    codeEtatCible = 'EN_PANNE';
  }

  const etat = await tx.etat_materiel.findFirst({
    where: {
      code: codeEtatCible,
    },
    select: {
      idEtat: true,
    },
  });

  if (!etat) {
    throw new BadRequestException(
      `État matériel introuvable : ${codeEtatCible}`,
    );
  }

  await tx.materiel.update({
    where: {
      idMateriel,
    },
    data: {
      idEtat: etat.idEtat,
    },
  });
}
  private async generateInterventionCode(typeMaintenance?: string) {
    const prefix =
      typeMaintenance?.toUpperCase() === 'PREVENTIF'
        ? 'OT-PREV'
        : typeMaintenance?.toUpperCase() === 'CORRECTIF'
          ? 'OT-COR'
          : 'OT';

    const count = await this.prisma.intervention.count();

    let index = count + 1;

    while (true) {
      const code = `${prefix}-${String(index).padStart(6, '0')}`;

      const exists = await this.prisma.intervention.findFirst({
        where: { code },
      });

      if (!exists) return code;

      index++;
    }
  }
}
