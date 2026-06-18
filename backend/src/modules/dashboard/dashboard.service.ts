import { Injectable } from '@nestjs/common';
import {
  CriticiteModele,
  StatutInventaire,
} from '../../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getGeneralDashboard() {
  const now = new Date();

  const [
    materielsActifs,
    interventionsEnCours,
    totalArticles,
    plansALancer,
    demandesEnAttente,
    interventionsEnRetard,
    totalEquipements,
    totalMagasins,
  ] = await Promise.all([
    this.prisma.materiel.count({
      where: {
        actif: true,
      },
    }),

    this.prisma.intervention.count({
      where: {
        etat: {
          in: [
            'EN_COURS',
            'EN_REALISATION',
            'ATTENTE_REALISATION',
            'PLANIFIEE',
            'PLANIFIE',
          ],
        },
      },
    }),

    this.prisma.article.count({
      where: {
        actif: true,
      },
    }),

    this.prisma.plan_preventif_declencheur.count({
      where: {
        actif: true,
        prochainLancementDate: {
          lte: now,
        },
      },
    }),

    this.prisma.demande_intervention.count({
      where: {
        statut: {
          in: [
            'EN_PREPARATION',
            'ATTENTE_PRISE_EN_COMPTE',
            'ATTENTE_REALISATION',
          ],
        },
      },
    }),

    this.prisma.intervention.count({
      where: {
        dateFinPrevue: {
          lt: now,
        },
        etat: {
          notIn: [
            'TERMINE',
            'TERMINEE',
            'CLOTURE',
            'CLOTUREE',
            'ANNULE',
            'ANNULEE',
          ],
        },
      },
    }),

    this.prisma.materiel.count(),

    this.prisma.magasin.count({
      where: {
        actif: true,
      },
    }),
  ]);

  return {
    materielsActifs,
    interventionsEnCours,
    totalArticles,
    plansALancer,
    demandesEnAttente,
    interventionsEnRetard,
    totalEquipements,
    totalMagasins,
  };
}

  async getEquipementsDashboard() {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    const [
      total,
      active,
      inactive,
      models,
      critical,
      measurePoints,
      lastAdded,
    ] = await Promise.all([
      this.prisma.materiel.count(),

      this.prisma.materiel.count({
        where: {
          actif: true,
        },
      }),

      this.prisma.materiel.count({
        where: {
          actif: false,
        },
      }),

      this.prisma.modele.count(),

      this.prisma.modele.count({
        where: {
          criticite: CriticiteModele.CRITIQUE,
        },
      }),

      this.prisma.point_mesure.count(),

      this.prisma.materiel.count({
        where: {
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
      }),
    ]);

    return {
      total,
      active,
      inactive,
      models,
      critical,
      measurePoints,
      lastAdded,
      status:
        inactive > 0 || critical > 0
          ? 'À surveiller'
          : 'Opérationnel',
    };
  }

  async getMaintenanceDashboard() {
    const now = new Date();

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const [
      totalDemands,
      pending,
      inProgress,
      completed,
      overdue,
      preventivePlans,
      scheduledInterventions,
    ] = await Promise.all([
      this.prisma.demande_intervention.count(),

      this.prisma.demande_intervention.count({
        where: {
          statut: {
            in: [
              'EN_PREPARATION',
              'ATTENTE_PRISE_EN_COMPTE',
              'ATTENTE_REALISATION',
            ],
          },
        },
      }),

      this.prisma.intervention.count({
        where: {
          etat: {
            in: [
              'EN_COURS',
              'EN_REALISATION',
              'ATTENTE_REALISATION',
              'PLANIFIEE',
              'PLANIFIE',
            ],
          },
        },
      }),

      this.prisma.intervention.count({
        where: {
          etat: {
            in: ['TERMINE', 'TERMINEE', 'CLOTURE', 'CLOTUREE'],
          },
        },
      }),

      this.prisma.intervention.count({
        where: {
          dateFinPrevue: {
            lt: now,
          },
          etat: {
            notIn: [
              'TERMINE',
              'TERMINEE',
              'CLOTURE',
              'CLOTUREE',
              'ANNULE',
              'ANNULEE',
            ],
          },
        },
      }),

      this.prisma.plan_preventif.count({
        where: {
          actif: true,
        },
      }),

      this.prisma.intervention.count({
        where: {
          dateDebutPrevue: {
            gte: startOfWeek,
            lte: endOfWeek,
          },
        },
      }),
    ]);

    const performance =
      totalDemands > 0 ? Math.round((completed / totalDemands) * 100) : 0;

    return {
      totalDemands,
      pending,
      inProgress,
      completed,
      overdue,
      preventivePlans,
      scheduledInterventions,
      performance,
    };
  }

  async getStockDashboard() {
    const [
      totalArticles,
      totalEntrees,
      totalSorties,
      totalMouvements,
      totalMagasins,
      totalInventaires,
      inventairesPrepares,
      dernieresOperations,
    ] = await Promise.all([
      this.prisma.article.count({
        where: {
          actif: true,
        },
      }),

      this.prisma.entree_stock.count(),

      this.prisma.sortie_stock.count(),

      this.prisma.mouvement_stock.count(),

      this.prisma.magasin.count({
        where: {
          actif: true,
        },
      }),

      this.prisma.inventairePrepare.count(),

      this.prisma.inventairePrepare.count({
        where: {
          statut: {
            in: [
              StatutInventaire.BROUILLON,
              StatutInventaire.EN_COMPTAGE,
            ],
          },
        },
      }),

      this.prisma.mouvement_stock.findMany({
        take: 5,
        orderBy: {
          dateMouvement: 'desc',
        },
        include: {
          article: {
            select: {
              reference: true,
              designation: true,
            },
          },
          magasinSource: {
            select: {
              code: true,
              libelle: true,
            },
          },
          magasinDestination: {
            select: {
              code: true,
              libelle: true,
            },
          },
        },
      }),
    ]);

    return {
      totalArticles,
      totalEntrees,
      totalSorties,
      totalMouvements,
      totalMagasins,
      totalInventaires,
      inventairesPrepares,
      dernieresOperations: dernieresOperations.map((operation) => {
        const type = operation.typeMouvement?.toUpperCase() || 'MOUVEMENT';
        const quantite = Number(operation.quantite || 0);

        const magasin =
          operation.magasinDestination || operation.magasinSource || null;

        return {
          id: operation.idMouvement,
          type: operation.typeMouvement,
          reference: `MVT-${operation.idMouvement}`,
          article:
            operation.article?.designation ||
            operation.article?.reference ||
            'Article non défini',
          magasin: magasin
            ? `${magasin.code} — ${magasin.libelle}`
            : 'Magasin non défini',
          date: operation.dateMouvement,
          quantity: this.formatQuantity(type, quantite),
        };
      }),
    };
  }

  private formatQuantity(type: string, quantite: number) {
    if (type.includes('ENTREE')) {
      return `+${quantite}`;
    }

    if (type.includes('SORTIE')) {
      return `-${Math.abs(quantite)}`;
    }

    return `${quantite}`;
  }
}