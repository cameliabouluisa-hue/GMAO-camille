import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePlanPreventifDto } from './dto/create-plan-preventif.dto';
import { UpdatePlanPreventifDto } from './dto/update-plan-preventif.dto';

@Injectable()
export class PlanPreventifService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.plan_preventif.findMany({
      orderBy: { idPlanPreventif: 'desc' },
      include: {
        materiel: {
          include: {
            modele: true,
          },
        },
        point_structure: true,
        plan_preventif_predefini: true,
        plan_preventif_declencheur: {
  include: {
    gamme: true,
    materiel: true,
    point_structure: true,
    point_mesure: true,
    modele: true,
    famille: true,
    ppp_declencheur: true,
  },
},
        intervention: true,
      },
    });
  }

  async findOne(id: number) {
    await this.ensurePlanExists(id);

    return this.prisma.plan_preventif.findUnique({
      where: { idPlanPreventif: id },
      include: {
        materiel: {
          include: {
            modele: true,
            etat_materiel: true,
            type_materiel: true,
          },
        },
        point_structure: true,
        plan_preventif_predefini: {
          include: {
            modele: true,
            ppp_declencheur: {
              include: {
                gamme: true,
                modele: true,
                 point_mesure: true,
              },
            },
          },
        },
        plan_preventif_declencheur: {
          include: {
            gamme: true,
            point_structure: true,
            materiel: true,
             point_mesure: true,
            modele: true,
            famille: true,
            ppp_declencheur: true,
            intervention: true,
            historique_declenchement_preventif: true,
          },
        },
        intervention: {
          include: {
            gamme: true,
            materiel: true,
          },
        },
      },
    });
  }

  async create(dto: CreatePlanPreventifDto) {
    await this.ensureUniqueCode(dto.code);

    if (dto.idMateriel !== undefined) {
      await this.ensureMaterielExists(dto.idMateriel);
    }

    if (dto.idPointStructure !== undefined) {
      await this.ensurePointStructureExists(dto.idPointStructure);
    }

    let sourcePpp:
      | Awaited<ReturnType<PlanPreventifService['getPppSourceWithDeclencheurs']>>
      | null = null;

    if (dto.idPlanPreventifPredefiniSource !== undefined) {
      sourcePpp = await this.getPppSourceWithDeclencheurs(
        dto.idPlanPreventifPredefiniSource,
      );
    }

    const data: Prisma.plan_preventifCreateInput = {
      code: dto.code,
      libelle: dto.libelle ?? null,
      etat: dto.etat ?? sourcePpp?.etat ?? 'ACTIF',
      typeDeclenchement:
        dto.typeDeclenchement ?? sourcePpp?.typeDeclenchement ?? null,
      organisation: dto.organisation ?? sourcePpp?.organisation ?? null,
      masquerLignesInactives: dto.masquerLignesInactives ?? true,
      actif: dto.actif ?? true,

      ...(dto.idMateriel !== undefined
        ? {
            materiel: {
              connect: { idMateriel: dto.idMateriel },
            },
          }
        : {}),

      ...(dto.idPointStructure !== undefined
        ? {
            point_structure: {
              connect: { idPoint: dto.idPointStructure },
            },
          }
        : {}),

      ...(dto.idPlanPreventifPredefiniSource !== undefined
        ? {
            plan_preventif_predefini: {
              connect: {
                idPlanPreventifPredefini: dto.idPlanPreventifPredefiniSource,
              },
            },
          }
        : {}),
    };

    const created = await this.prisma.plan_preventif.create({
      data,
      include: {
        materiel: true,
        point_structure: true,
        plan_preventif_predefini: true,
      },
    });

    if (sourcePpp && sourcePpp.ppp_declencheur.length > 0) {
      await this.copyDeclencheursFromPpp(
        created.idPlanPreventif,
        sourcePpp,
        dto.idMateriel,
        dto.idPointStructure,
      );
    }

    return this.findOne(created.idPlanPreventif);
  }

  async update(id: number, dto: UpdatePlanPreventifDto) {
    await this.ensurePlanExists(id);

    if (dto.code !== undefined) {
      await this.ensureUniqueCode(dto.code, id);
    }

    if (dto.idMateriel !== undefined) {
      await this.ensureMaterielExists(dto.idMateriel);
    }

    if (dto.idPointStructure !== undefined) {
      await this.ensurePointStructureExists(dto.idPointStructure);
    }

    if (dto.idPlanPreventifPredefiniSource !== undefined) {
      await this.ensurePppExists(dto.idPlanPreventifPredefiniSource);
    }

    const data: Prisma.plan_preventifUpdateInput = {
      ...(dto.code !== undefined ? { code: dto.code } : {}),
      ...(dto.libelle !== undefined ? { libelle: dto.libelle } : {}),
      ...(dto.etat !== undefined ? { etat: dto.etat } : {}),
      ...(dto.typeDeclenchement !== undefined
        ? { typeDeclenchement: dto.typeDeclenchement }
        : {}),
      ...(dto.organisation !== undefined
        ? { organisation: dto.organisation }
        : {}),
      ...(dto.masquerLignesInactives !== undefined
        ? { masquerLignesInactives: dto.masquerLignesInactives }
        : {}),
      ...(dto.actif !== undefined ? { actif: dto.actif } : {}),

      ...(dto.idMateriel !== undefined
        ? {
            materiel: {
              connect: { idMateriel: dto.idMateriel },
            },
          }
        : {}),

      ...(dto.idPointStructure !== undefined
        ? {
            point_structure: {
              connect: { idPoint: dto.idPointStructure },
            },
          }
        : {}),

      ...(dto.idPlanPreventifPredefiniSource !== undefined
        ? {
            plan_preventif_predefini: {
              connect: {
                idPlanPreventifPredefini: dto.idPlanPreventifPredefiniSource,
              },
            },
          }
        : {}),
    };

    await this.prisma.plan_preventif.update({
      where: { idPlanPreventif: id },
      data,
    });

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.ensurePlanExists(id);

    const interventionsCount = await this.prisma.intervention.count({
      where: { idPlanPreventif: id },
    });

    if (interventionsCount > 0) {
      throw new ConflictException(
        'Impossible de supprimer ce plan préventif : des interventions y sont déjà liées.',
      );
    }

    await this.prisma.historique_declenchement_preventif.deleteMany({
      where: {
        plan_preventif_declencheur: {
          idPlanPreventif: id,
        },
      },
    });

    await this.prisma.plan_preventif_declencheur.deleteMany({
      where: { idPlanPreventif: id },
    });

    return this.prisma.plan_preventif.delete({
      where: { idPlanPreventif: id },
    });
  }

  async regenerateDeclencheurs(id: number) {
    const plan = await this.prisma.plan_preventif.findUnique({
      where: { idPlanPreventif: id },
      include: {
        plan_preventif_predefini: {
          include: {
            ppp_declencheur: true,
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('Plan préventif introuvable.');
    }

    if (!plan.idPlanPreventifPredefiniSource || !plan.plan_preventif_predefini) {
      throw new ConflictException(
        'Ce plan préventif n’a pas de plan préventif prédéfini source.',
      );
    }

    const linkedInterventions = await this.prisma.intervention.count({
      where: { idPlanPreventif: id },
    });

    if (linkedInterventions > 0) {
      throw new ConflictException(
        'Impossible de régénérer les déclencheurs : des interventions sont déjà liées au plan.',
      );
    }

    await this.prisma.historique_declenchement_preventif.deleteMany({
      where: {
        plan_preventif_declencheur: {
          idPlanPreventif: id,
        },
      },
    });

    await this.prisma.plan_preventif_declencheur.deleteMany({
      where: { idPlanPreventif: id },
    });

    if (!plan.idPlanPreventifPredefiniSource) {
  throw new NotFoundException(
    'Aucun plan préventif prédéfini source associé à ce plan.',
  );
}

const sourcePpp = await this.getPppSourceWithDeclencheurs(
  plan.idPlanPreventifPredefiniSource,
);

await this.copyDeclencheursFromPpp(
  id,
  sourcePpp,
  plan.idMateriel ?? undefined,
  plan.idPointStructure ?? undefined,
);
    return this.findOne(id);
  }

  async findAllDeclencheurs() {
    return this.prisma.plan_preventif_declencheur.findMany({
      orderBy: {
        idPlanPreventifDeclencheur: 'desc',
      },
      include: {
        plan_preventif: true,
        ppp_declencheur: true,
        gamme: {
          include: {
            gamme_operation: {
              orderBy: {
                ordre: 'asc',
              },
            },
          },
        },
        materiel: true,
        point_structure: true,
        modele: true,
        point_mesure: true,
        famille: true,
        intervention: true,
        historique_declenchement_preventif: true,
      },
    });
  }

  async findDeclencheursByPlan(idPlanPreventif: number) {
    await this.ensurePlanExists(idPlanPreventif);

    return this.prisma.plan_preventif_declencheur.findMany({
      where: {
        idPlanPreventif,
      },
      orderBy: [
        {
          priorite: 'asc',
        },
        {
          idPlanPreventifDeclencheur: 'asc',
        },
      ],
      include: {
        plan_preventif: true,
        ppp_declencheur: true,
        gamme: {
          include: {
            gamme_operation: {
              orderBy: {
                ordre: 'asc',
              },
            },
          },
        },
        materiel: true,
        point_structure: true,
        modele: true,
        point_mesure: true,
        famille: true,
        intervention: true,
        historique_declenchement_preventif: true,
      },
    });
  }

  async generateOtFromDeclencheur(idDeclencheur: number) {
    const declencheur =
      await this.prisma.plan_preventif_declencheur.findUnique({
        where: {
          idPlanPreventifDeclencheur: idDeclencheur,
        },
        include: {
          plan_preventif: true,
          gamme: {
            include: {
              gamme_operation: {
                orderBy: {
                  ordre: 'asc',
                },
              },
            },
          },
          materiel: true,
          point_structure: true,
          point_mesure: true,
        },
      });

    if (!declencheur) {
      throw new NotFoundException('Déclencheur préventif introuvable.');
    }

    if (declencheur.actif === false) {
      throw new ConflictException('Ce déclencheur est inactif.');
    }

    if (!declencheur.idMateriel && !declencheur.idPointStructure) {
      throw new ConflictException(
        'Le déclencheur doit être lié à un matériel ou à un point de structure.',
      );
    }

    const codeOt = await this.generateOtCode();

    const result = await this.prisma.$transaction(async (tx) => {
      const intervention = await tx.intervention.create({
        data: {
          code: codeOt,
          typeMaintenance: 'PREVENTIF',
          dateDebut: declencheur.prochainLancementDate ?? new Date(),
          etat: declencheur.etatInterventionCible ?? 'A_PLANIFIER',
          idMateriel: declencheur.idMateriel,
          idGamme: declencheur.idGamme,
          origineGeneration: 'PLAN_PREVENTIF',
          idPlanPreventif: declencheur.idPlanPreventif,
          idPlanPreventifDeclencheur:
            declencheur.idPlanPreventifDeclencheur,
        },
      });

      if (declencheur.gamme.gamme_operation.length > 0) {
        await tx.operation_intervention.createMany({
          data: declencheur.gamme.gamme_operation.map((operation) => ({
            ordre: operation.ordre,
            libelle: operation.libelle,
            tempsPasse: operation.tempsStandard,
            idIntervention: intervention.idIntervention,
            description: operation.description,
            obligatoire: operation.obligatoire ?? false,
            idGammeOperationSource: operation.idOperation,
          })),
        });
      }

      const historique =
        await tx.historique_declenchement_preventif.create({
          data: {
            idPlanPreventifDeclencheur:
              declencheur.idPlanPreventifDeclencheur,
            idIntervention: intervention.idIntervention,
            idMateriel: declencheur.idMateriel,
            idPointStructure: declencheur.idPointStructure,
            conditionResume: `OT préventif généré depuis le déclencheur ${declencheur.idPlanPreventifDeclencheur}`,
            fictif: false,
            statut: 'OT_GENERE',
          },
        });

      await tx.plan_preventif_declencheur.update({
        where: {
          idPlanPreventifDeclencheur:
            declencheur.idPlanPreventifDeclencheur,
        },
        data: {
          derniereRealisationDate: new Date(),
          derniereRealisationPrevueDate:
            declencheur.prochainLancementDate ?? new Date(),
          prochainLancementDate: this.calculateNextDateFromDeclencheur(
            declencheur.prochainLancementDate ?? new Date(),
            declencheur.periodiciteValeur,
            declencheur.periodiciteUnite,
          ),
        },
      });

      const interventionComplete = await tx.intervention.findUnique({
        where: {
          idIntervention: intervention.idIntervention,
        },
        include: {
          gamme: true,
          materiel: true,
          operation_intervention: {
            orderBy: {
              ordre: 'asc',
            },
          },
          affectation_technicien: {
            include: {
              technicien: true,
            },
          },
        },
      });

      return {
        intervention: interventionComplete,
        historique,
      };
    });

    return {
      message: 'OT préventif généré avec succès.',
      ...result,
    };
  }

 private async copyDeclencheursFromPpp(
  idPlanPreventif: number,
  sourcePpp: Awaited<
    ReturnType<PlanPreventifService['getPppSourceWithDeclencheurs']>
  >,
  idMateriel?: number,
  idPointStructure?: number,
) {
  for (const declencheur of sourcePpp.ppp_declencheur) {
    let prochainLancementDate: Date | null = null;

    if (
      declencheur.typeDeclencheur === 'CALENDAIRE' &&
      declencheur.nombreJoursPremierLancement !== null &&
      declencheur.nombreJoursPremierLancement !== undefined
    ) {
      const date = new Date();
      date.setDate(
        date.getDate() + Number(declencheur.nombreJoursPremierLancement),
      );
      prochainLancementDate = date;
    }

    await this.prisma.plan_preventif_declencheur.create({
      data: {
        plan_preventif: {
          connect: { idPlanPreventif },
        },

        ...(declencheur.idPppDeclencheur
          ? {
              ppp_declencheur: {
                connect: { idPppDeclencheur: declencheur.idPppDeclencheur },
              },
            }
          : {}),

        gamme: {
          connect: { idGamme: declencheur.idGamme },
        },

        ...(declencheur.idPointMesure !== null &&
        declencheur.idPointMesure !== undefined
          ? {
              point_mesure: {
                connect: { idPointMesure: declencheur.idPointMesure },
              },
            }
          : {}),

        priorite: declencheur.priorite ?? 1,
        etat: declencheur.etat ?? null,
        typeDeclencheur: declencheur.typeDeclencheur,
        etatInterventionCible: declencheur.etatInterventionCible ?? null,
        actualisation: declencheur.actualisation ?? null,
        horizonJours: declencheur.horizonJours ?? null,
        toleranceJours: declencheur.toleranceJours ?? null,

        periodiciteValeur:
          declencheur.typeDeclencheur === 'CALENDAIRE'
            ? declencheur.periodiciteValeur ?? null
            : null,

        periodiciteUnite:
          declencheur.typeDeclencheur === 'CALENDAIRE'
            ? declencheur.periodiciteUnite ?? null
            : null,

        prochainLancementDate,

        operateur:
          declencheur.typeDeclencheur === 'COMPTEUR' ||
          declencheur.typeDeclencheur === 'CONDITIONNEL'
            ? declencheur.operateur ?? null
            : null,

        seuilValeur:
          declencheur.typeDeclencheur === 'COMPTEUR' ||
          declencheur.typeDeclencheur === 'CONDITIONNEL'
            ? declencheur.seuilValeur ?? null
            : null,

        symptomeCode: declencheur.symptomeCode ?? null,
        saisonnaliteDu: declencheur.saisonnaliteDu ?? null,
        saisonnaliteAu: declencheur.saisonnaliteAu ?? null,
        actif: declencheur.actif ?? true,

        ...(idMateriel !== undefined
          ? {
              materiel: {
                connect: { idMateriel },
              },
            }
          : {}),

        ...(idPointStructure !== undefined
          ? {
              point_structure: {
                connect: { idPoint: idPointStructure },
              },
            }
          : {}),

        ...(declencheur.idModele !== null && declencheur.idModele !== undefined
          ? {
              modele: {
                connect: { idModele: declencheur.idModele },
              },
            }
          : {}),
      },
    });
  }
}

  private async getPppSourceWithDeclencheurs(id: number) {
    const ppp = await this.prisma.plan_preventif_predefini.findUnique({
      where: { idPlanPreventifPredefini: id },
      include: {
  ppp_declencheur: {
    include: {
      point_mesure: true,
    },
  },
},
    });

    if (!ppp) {
      throw new NotFoundException(
        'Plan préventif prédéfini source introuvable.',
      );
    }

    return ppp;
  }

  private async ensurePlanExists(id: number) {
    const plan = await this.prisma.plan_preventif.findUnique({
      where: { idPlanPreventif: id },
      select: { idPlanPreventif: true },
    });

    if (!plan) {
      throw new NotFoundException('Plan préventif introuvable.');
    }

    return plan;
  }

  private async ensurePppExists(id: number) {
    const ppp = await this.prisma.plan_preventif_predefini.findUnique({
      where: { idPlanPreventifPredefini: id },
      select: { idPlanPreventifPredefini: true },
    });

    if (!ppp) {
      throw new NotFoundException(
        'Plan préventif prédéfini source introuvable.',
      );
    }

    return ppp;
  }

  private async ensureMaterielExists(id: number) {
    const materiel = await this.prisma.materiel.findUnique({
      where: { idMateriel: id },
      select: { idMateriel: true },
    });

    if (!materiel) {
      throw new NotFoundException('Matériel introuvable.');
    }

    return materiel;
  }

  private async ensurePointStructureExists(id: number) {
    const point = await this.prisma.point_structure.findUnique({
      where: { idPoint: id },
      select: { idPoint: true },
    });

    if (!point) {
      throw new NotFoundException('Point de structure introuvable.');
    }

    return point;
  }

  private async ensureUniqueCode(code: string, currentId?: number) {
    const existing = await this.prisma.plan_preventif.findFirst({
      where: {
        code,
        ...(currentId !== undefined
          ? { NOT: { idPlanPreventif: currentId } }
          : {}),
      },
      select: { idPlanPreventif: true },
    });

    if (existing) {
      throw new ConflictException(
        'Un plan préventif avec ce code existe déjà.',
      );
    }
  }

  private async generateOtCode() {
    const count = await this.prisma.intervention.count({
      where: {
        origineGeneration: 'PLAN_PREVENTIF',
      },
    });

    return `OT-PREV-${String(count + 1).padStart(5, '0')}`;
  }

  private calculateNextDateFromDeclencheur(
    baseDate: Date,
    periodiciteValeur?: number | null,
    periodiciteUnite?: string | null,
  ) {
    if (!periodiciteValeur || !periodiciteUnite) {
      return null;
    }

    const nextDate = new Date(baseDate);

    switch (periodiciteUnite.toUpperCase()) {
      case 'JOUR':
      case 'JOURS':
      case 'DAY':
      case 'DAYS':
        nextDate.setDate(nextDate.getDate() + periodiciteValeur);
        break;

      case 'SEMAINE':
      case 'SEMAINES':
      case 'WEEK':
      case 'WEEKS':
        nextDate.setDate(nextDate.getDate() + periodiciteValeur * 7);
        break;

      case 'MOIS':
      case 'MONTH':
      case 'MONTHS':
        nextDate.setMonth(nextDate.getMonth() + periodiciteValeur);
        break;

      case 'AN':
      case 'ANS':
      case 'ANNEE':
      case 'ANNEES':
      case 'YEAR':
      case 'YEARS':
        nextDate.setFullYear(nextDate.getFullYear() + periodiciteValeur);
        break;

      default:
        return null;
    }

    return nextDate;
  }
}