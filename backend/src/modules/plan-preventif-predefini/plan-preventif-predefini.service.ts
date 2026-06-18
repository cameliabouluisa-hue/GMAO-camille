import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePlanPreventifPredefiniDto } from './dto/create-plan-preventif-predefini.dto';
import { UpdatePlanPreventifPredefiniDto } from './dto/update-plan-preventif-predefini.dto';
import { CreatePppDeclencheurDto } from './dto/create-ppp-declencheur.dto';
import { UpdatePppDeclencheurDto } from './dto/update-ppp-declencheur.dto';

@Injectable()
export class PlanPreventifPredefiniService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePlanPreventifPredefiniDto) {
    return this.prisma.plan_preventif_predefini.create({
      data: {
        code: dto.code ?? '',
        titre: dto.libelle ?? null,
        etat: dto.etat ?? null,
        typeDeclenchement: dto.typeDeclenchement ?? null,
        organisation: dto.organisation ?? null,
        idModele: dto.idModele ?? null,
        actif: dto.actif ?? true,
      },
      include: this.defaultPlanInclude(),
    });
  }
  findAll() {
  return this.prisma.plan_preventif_predefini.findMany({
    include: {
      modele: true,
      ppp_declencheur: true,
    },
    orderBy: {
      idPlanPreventifPredefini: 'desc',
    },
  });
}

 async findOne(idPlanPreventifPredefini: number) {
  const ppp = await this.prisma.plan_preventif_predefini.findUnique({
    where: { idPlanPreventifPredefini },
    include: {
      modele: true,
      ppp_declencheur: true,
    },
  });

  if (!ppp) {
    throw new NotFoundException('Plan préventif prédéfini introuvable.');
  }

  return ppp;
}

  async update(id: number, dto: UpdatePlanPreventifPredefiniDto) {
    await this.ensurePlanExists(id);

    return this.prisma.plan_preventif_predefini.update({
      where: { idPlanPreventifPredefini: id },
      data: {
        ...(dto.code !== undefined ? { code: dto.code } : {}),
        ...(dto.libelle !== undefined ? { titre: dto.libelle } : {}),
        ...(dto.etat !== undefined ? { etat: dto.etat } : {}),
        ...(dto.typeDeclenchement !== undefined
          ? { typeDeclenchement: dto.typeDeclenchement }
          : {}),
        ...(dto.organisation !== undefined
          ? { organisation: dto.organisation }
          : {}),
        ...(dto.idModele !== undefined ? { idModele: dto.idModele } : {}),
        ...(dto.actif !== undefined ? { actif: dto.actif } : {}),
      },
      include: this.defaultPlanInclude(),
    });
  }

  async remove(id: number) {
    await this.ensurePlanExists(id);

    return this.prisma.plan_preventif_predefini.delete({
      where: { idPlanPreventifPredefini: id },
    });
  }

  async createDeclencheur(
    idPlanPreventifPredefini: number,
    dto: CreatePppDeclencheurDto,
  ) {
    await this.ensurePlanExists(idPlanPreventifPredefini);

    if (!dto.idGamme) {
      throw new BadRequestException(
        'La gamme est obligatoire pour créer un déclencheur PPP.',
      );
    }

    const typeDeclencheur = dto.typeDeclencheur ?? 'CALENDAIRE';

    await this.validateDeclencheur({
      typeDeclencheur,
      idGamme: dto.idGamme,
      idModele: dto.idModele,
      idPointMesure: dto.idPointMesure,
      periodiciteValeur: dto.periodiciteValeur,
      periodiciteUnite: dto.periodiciteUnite,
      operateur: dto.operateur,
      seuilValeur: dto.seuilValeur,
    });

    const isCalendaire = typeDeclencheur === 'CALENDAIRE';
    const isMesure =
      typeDeclencheur === 'COMPTEUR' ||
      typeDeclencheur === 'CONDITIONNEL';

    return this.prisma.ppp_declencheur.create({
      data: {
        idPlanPreventifPredefini,
        priorite: dto.priorite ?? 1,
        etat: dto.etat ?? 'ACTIF',
        typeDeclencheur,

        idGamme: dto.idGamme,
        idModele: dto.idModele ?? null,
        idPointMesure: isMesure ? dto.idPointMesure ?? null : null,

        etatInterventionCible: dto.etatInterventionCible ?? 'A_VALIDER',
        horizonJours: dto.horizonJours ?? null,
        toleranceJours: dto.toleranceJours ?? null,
        actualisation: dto.actualisation ?? null,

        periodiciteValeur: isCalendaire
          ? dto.periodiciteValeur ?? null
          : null,
        periodiciteUnite: isCalendaire
          ? dto.periodiciteUnite ?? null
          : null,
        nombreJoursPremierLancement: isCalendaire
          ? dto.nombreJoursPremierLancement ?? null
          : null,

        operateur: isMesure ? dto.operateur ?? null : null,
        seuilValeur:
          isMesure && dto.seuilValeur !== undefined && dto.seuilValeur !== null
            ? new Prisma.Decimal(dto.seuilValeur)
            : null,

        symptomeCode: dto.symptomeCode ?? null,
        saisonnaliteDu: null,
        saisonnaliteAu: null,
        actif: dto.actif ?? true,
      },
      include: this.defaultDeclencheurInclude(),
    });
  }

  async findDeclencheursByPlan(idPlanPreventifPredefini: number) {
    await this.ensurePlanExists(idPlanPreventifPredefini);

    return this.prisma.ppp_declencheur.findMany({
      where: { idPlanPreventifPredefini },
      include: this.defaultDeclencheurInclude(),
      orderBy: {
        priorite: 'asc',
      },
    });
  }

  async updateDeclencheur(
    idDeclencheur: number,
    dto: UpdatePppDeclencheurDto,
  ) {
    const existing = await this.prisma.ppp_declencheur.findUnique({
      where: { idPppDeclencheur: idDeclencheur },
    });

    if (!existing) {
      throw new NotFoundException(`Déclencheur PPP ${idDeclencheur} introuvable`);
    }

    const typeDeclencheur = dto.typeDeclencheur ?? existing.typeDeclencheur;

    const idGamme = dto.idGamme ?? existing.idGamme;
    const idModele =
      dto.idModele !== undefined ? dto.idModele : existing.idModele;
    const idPointMesure =
      dto.idPointMesure !== undefined
        ? dto.idPointMesure
        : existing.idPointMesure;

    const periodiciteValeur =
      dto.periodiciteValeur !== undefined
        ? dto.periodiciteValeur
        : existing.periodiciteValeur;

    const periodiciteUnite =
      dto.periodiciteUnite !== undefined
        ? dto.periodiciteUnite
        : existing.periodiciteUnite;

    const operateur =
      dto.operateur !== undefined ? dto.operateur : existing.operateur;

    const seuilValeur =
      dto.seuilValeur !== undefined ? dto.seuilValeur : existing.seuilValeur;

    await this.validateDeclencheur({
      typeDeclencheur,
      idGamme,
      idModele,
      idPointMesure,
      periodiciteValeur,
      periodiciteUnite,
      operateur,
      seuilValeur,
    });

    const isCalendaire = typeDeclencheur === 'CALENDAIRE';
    const isMesure =
      typeDeclencheur === 'COMPTEUR' ||
      typeDeclencheur === 'CONDITIONNEL';

    return this.prisma.ppp_declencheur.update({
      where: { idPppDeclencheur: idDeclencheur },
      data: {
        ...(dto.priorite !== undefined ? { priorite: dto.priorite } : {}),
        ...(dto.etat !== undefined ? { etat: dto.etat } : {}),
        typeDeclencheur,

        ...(dto.idGamme !== undefined ? { idGamme: dto.idGamme } : {}),
        ...(dto.idModele !== undefined ? { idModele: dto.idModele } : {}),

        idPointMesure: isMesure ? idPointMesure : null,

        ...(dto.etatInterventionCible !== undefined
          ? { etatInterventionCible: dto.etatInterventionCible }
          : {}),
        ...(dto.horizonJours !== undefined
          ? { horizonJours: dto.horizonJours }
          : {}),
        ...(dto.toleranceJours !== undefined
          ? { toleranceJours: dto.toleranceJours }
          : {}),
        ...(dto.actualisation !== undefined
          ? { actualisation: dto.actualisation }
          : {}),

        periodiciteValeur: isCalendaire ? periodiciteValeur : null,
        periodiciteUnite: isCalendaire ? periodiciteUnite : null,

        ...(dto.nombreJoursPremierLancement !== undefined
          ? {
              nombreJoursPremierLancement: isCalendaire
                ? dto.nombreJoursPremierLancement
                : null,
            }
          : {}),

        operateur: isMesure ? operateur : null,
        seuilValeur:
          isMesure && seuilValeur !== undefined && seuilValeur !== null
            ? new Prisma.Decimal(seuilValeur)
            : null,

        ...(dto.symptomeCode !== undefined
          ? { symptomeCode: dto.symptomeCode }
          : {}),
        ...(dto.actif !== undefined ? { actif: dto.actif } : {}),
      },
      include: this.defaultDeclencheurInclude(),
    });
  }

  async removeDeclencheur(idDeclencheur: number) {
    await this.ensureDeclencheurExists(idDeclencheur);

    return this.prisma.ppp_declencheur.delete({
      where: { idPppDeclencheur: idDeclencheur },
    });
  }

  private async validateDeclencheur(data: {
    typeDeclencheur: string;
    idGamme?: number | null;
    idModele?: number | null;
    idPointMesure?: number | null;
    periodiciteValeur?: number | null;
    periodiciteUnite?: string | null;
    operateur?: string | null;
    seuilValeur?: number | string | Prisma.Decimal | null;
  }) {
    if (!data.idGamme) {
      throw new BadRequestException('La gamme est obligatoire.');
    }

    const gamme = await this.prisma.gamme.findUnique({
      where: { idGamme: data.idGamme },
      select: { idGamme: true },
    });

    if (!gamme) {
      throw new NotFoundException('Gamme introuvable.');
    }

    if (data.idModele !== undefined && data.idModele !== null) {
      const modele = await this.prisma.modele.findUnique({
        where: { idModele: data.idModele },
        select: { idModele: true },
      });

      if (!modele) {
        throw new NotFoundException('Modèle introuvable.');
      }
    }

    if (data.typeDeclencheur === 'CALENDAIRE') {
      if (!data.periodiciteValeur || !data.periodiciteUnite) {
        throw new BadRequestException(
          'Un déclencheur calendaire doit avoir une périodicité valeur et une unité.',
        );
      }

      return;
    }

    if (
      data.typeDeclencheur === 'COMPTEUR' ||
      data.typeDeclencheur === 'CONDITIONNEL'
    ) {
      if (!data.idPointMesure) {
        throw new BadRequestException(
          'Un déclencheur compteur ou conditionnel doit avoir un point de mesure.',
        );
      }

      if (
        !data.operateur ||
        data.seuilValeur === undefined ||
        data.seuilValeur === null
      ) {
        throw new BadRequestException(
          'Un déclencheur compteur ou conditionnel doit avoir un opérateur et une valeur seuil.',
        );
      }

      const pointMesure = await this.prisma.point_mesure.findUnique({
        where: { idPointMesure: data.idPointMesure },
        select: {
          idPointMesure: true,
          type: true,
          actif: true,
        },
      });

      if (!pointMesure) {
        throw new NotFoundException('Point de mesure introuvable.');
      }

      if (pointMesure.actif === false) {
        throw new BadRequestException(
          'Impossible d’utiliser un point de mesure inactif.',
        );
      }

      if (pointMesure.type !== data.typeDeclencheur) {
        throw new BadRequestException(
          `Le point de mesure est de type ${pointMesure.type}, mais le déclencheur est de type ${data.typeDeclencheur}.`,
        );
      }

      return;
    }

    throw new BadRequestException('Type de déclencheur invalide.');
  }

  private async ensurePlanExists(id: number) {
    const item = await this.prisma.plan_preventif_predefini.findUnique({
      where: { idPlanPreventifPredefini: id },
      select: { idPlanPreventifPredefini: true },
    });

    if (!item) {
      throw new NotFoundException(
        `Plan préventif prédéfini ${id} introuvable`,
      );
    }
  }

  private async ensureDeclencheurExists(id: number) {
    const item = await this.prisma.ppp_declencheur.findUnique({
      where: { idPppDeclencheur: id },
      select: { idPppDeclencheur: true },
    });

    if (!item) {
      throw new NotFoundException(`Déclencheur PPP ${id} introuvable`);
    }
  }

  private defaultPlanInclude() {
    return {
      modele: true,
      ppp_declencheur: {
        orderBy: { priorite: 'asc' as const },
        include: {
          gamme: true,
          modele: true,
          point_mesure: true,
        },
      },
      plan_preventif: true,
    };
  }

  private defaultPlanDetailInclude() {
    return {
      modele: true,
      ppp_declencheur: {
        include: {
          gamme: true,
          modele: true,
          point_mesure: true,
          plan_preventif_declencheur: true,
        },
        orderBy: { priorite: 'asc' as const },
      },
      plan_preventif: true,
    };
  }

  private defaultDeclencheurInclude() {
    return {
      plan_preventif_predefini: true,
      gamme: true,
      modele: true,
      point_mesure: true,
      plan_preventif_declencheur: true,
    };
  }
}