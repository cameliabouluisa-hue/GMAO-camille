import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '../../../generated/prisma/client';

import { CreateReleveMesureDto } from './dto/create-releve-mesure.dto';
import { UpdateReleveMesureDto } from './dto/update-releve-mesure.dto';
import { PlanPreventifService } from '../plan-preventif/plan-preventif.service';

type ReleveMesureFilters = {
  idPointMesure?: number;
  correction?: boolean;
};

@Injectable()
export class ReleveMesureService {
  private readonly logger = new Logger(ReleveMesureService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly planPreventifService: PlanPreventifService,
  ) {}

  async create(dto: CreateReleveMesureDto) {
    const pointMesure = await this.findPointMesureOrFail(dto.idPointMesure);

    const dateReleve = this.parseDate(dto.dateReleve);
    const valeur = new Prisma.Decimal(dto.valeur);

    this.validateValeur(pointMesure, valeur);

    const previousReleve = await this.prisma.releve_mesure.findFirst({
      where: {
        idPointMesure: dto.idPointMesure,
      },
      orderBy: [{ dateReleve: 'desc' }, { idReleveMesure: 'desc' }],
    });

    if (
      pointMesure.type === 'COMPTEUR' &&
      previousReleve &&
      valeur.lessThan(previousReleve.valeur) &&
      dto.correction !== true
    ) {
      throw new BadRequestException(
        'La valeur d’un compteur ne peut pas diminuer sauf si le relevé est marqué comme correction.',
      );
    }

    const variation =
      dto.variation !== undefined && dto.variation !== null
        ? new Prisma.Decimal(dto.variation)
        : previousReleve
          ? valeur.minus(previousReleve.valeur)
          : null;

    const releve = await this.prisma.$transaction(async (tx) => {
      const created = await tx.releve_mesure.create({
        data: {
          idPointMesure: dto.idPointMesure,
          dateReleve,
          valeur,
          variation,
          commentaire: dto.commentaire?.trim() || null,
          correction: dto.correction ?? false,
        },
        include: this.defaultInclude(),
      });

      await tx.point_mesure.update({
        where: {
          idPointMesure: dto.idPointMesure,
        },
        data: {
          derniereValeur: created.valeur,
          derniereDate: created.dateReleve,
        },
      });

      return created;
    });

    await this.genererOtAutomatiquesSiDeclencheursAtteints(
      dto.idPointMesure,
      valeur,
    );

    return releve;
  }

  async findAll(filters: ReleveMesureFilters) {
    const where: Prisma.releve_mesureWhereInput = {};

    if (filters.idPointMesure !== undefined) {
      where.idPointMesure = filters.idPointMesure;
    }

    if (filters.correction !== undefined) {
      where.correction = filters.correction;
    }

    return this.prisma.releve_mesure.findMany({
      where,
      orderBy: [{ dateReleve: 'desc' }, { idReleveMesure: 'desc' }],
      include: this.defaultInclude(),
    });
  }

  async findOne(idReleveMesure: number) {
    const releve = await this.prisma.releve_mesure.findUnique({
      where: { idReleveMesure },
      include: this.defaultInclude(),
    });

    if (!releve) {
      throw new NotFoundException('Relevé de mesure introuvable.');
    }

    return releve;
  }

  async update(idReleveMesure: number, dto: UpdateReleveMesureDto) {
    const existing = await this.prisma.releve_mesure.findUnique({
      where: { idReleveMesure },
    });

    if (!existing) {
      throw new NotFoundException('Relevé de mesure introuvable.');
    }

    const idPointMesure = dto.idPointMesure ?? existing.idPointMesure;
    const pointMesure = await this.findPointMesureOrFail(idPointMesure);

    const finalValeur =
      dto.valeur !== undefined && dto.valeur !== null
        ? new Prisma.Decimal(dto.valeur)
        : existing.valeur;

    this.validateValeur(pointMesure, finalValeur);

    const finalDateReleve =
      dto.dateReleve !== undefined
        ? this.parseDate(dto.dateReleve)
        : existing.dateReleve;

    const finalVariation =
      dto.variation !== undefined
        ? this.toDecimalOrNull(dto.variation)
        : existing.variation;

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.releve_mesure.update({
        where: { idReleveMesure },
        data: {
          ...(dto.idPointMesure !== undefined && {
            idPointMesure: dto.idPointMesure,
          }),
          ...(dto.dateReleve !== undefined && {
            dateReleve: finalDateReleve,
          }),
          ...(dto.valeur !== undefined && {
            valeur: finalValeur,
          }),
          ...(dto.variation !== undefined && {
            variation: finalVariation,
          }),
          ...(dto.commentaire !== undefined && {
            commentaire: dto.commentaire?.trim() || null,
          }),
          ...(dto.correction !== undefined && {
            correction: dto.correction,
          }),
        },
        include: this.defaultInclude(),
      });

      await this.refreshDernierReleve(tx, idPointMesure);

      return result;
    });

    if (dto.valeur !== undefined || dto.idPointMesure !== undefined) {
      await this.genererOtAutomatiquesSiDeclencheursAtteints(
        idPointMesure,
        finalValeur,
      );
    }

    return updated;
  }

  async remove(idReleveMesure: number) {
    const existing = await this.prisma.releve_mesure.findUnique({
      where: { idReleveMesure },
    });

    if (!existing) {
      throw new NotFoundException('Relevé de mesure introuvable.');
    }

    return this.prisma.$transaction(async (tx) => {
      const deleted = await tx.releve_mesure.delete({
        where: { idReleveMesure },
        include: this.defaultInclude(),
      });

      await this.refreshDernierReleve(tx, existing.idPointMesure);

      return deleted;
    });
  }

  private async genererOtAutomatiquesSiDeclencheursAtteints(
    idPointMesure: number,
    valeur: Prisma.Decimal,
  ) {
    const declencheurs =
      await this.prisma.plan_preventif_declencheur.findMany({
        where: {
          idPointMesure,
          actif: true,
          typeDeclencheur: {
            in: ['COMPTEUR', 'CONDITIONNEL'],
          },
        },
        include: {
          plan_preventif: true,
          point_mesure: true,
          intervention: {
            select: {
              idIntervention: true,
              etat: true,
            },
          },
        },
      });

    for (const declencheur of declencheurs) {
      const plan = declencheur.plan_preventif;

      if (!plan) continue;

      if (plan.actif === false) continue;

      if (plan.etat && plan.etat !== 'ACTIF') continue;

      if (plan.typeDeclenchement !== 'AUTOMATIQUE') continue;

      if (!declencheur.operateur || !declencheur.seuilValeur) continue;

      const conditionAtteinte = this.evaluerCondition(
        valeur,
        declencheur.operateur,
        declencheur.seuilValeur,
      );

      if (!conditionAtteinte) continue;

      if (this.existeOtOuvert(declencheur.intervention)) {
        continue;
      }

      try {
        await this.planPreventifService.generateOtFromDeclencheur(
          declencheur.idPlanPreventifDeclencheur,
        );
      } catch (error) {
        this.logger.warn(
          `Impossible de générer automatiquement l’OT pour le déclencheur ${declencheur.idPlanPreventifDeclencheur}.`,
        );
      }
    }
  }

  private evaluerCondition(
    valeur: Prisma.Decimal,
    operateur: string,
    seuil: Prisma.Decimal,
  ) {
    switch (operateur) {
      case '>=':
        return valeur.greaterThanOrEqualTo(seuil);

      case '>':
        return valeur.greaterThan(seuil);

      case '<=':
        return valeur.lessThanOrEqualTo(seuil);

      case '<':
        return valeur.lessThan(seuil);

      case '=':
      case '==':
        return valeur.equals(seuil);

      default:
        return false;
    }
  }

  private existeOtOuvert(
    interventions: Array<{
      idIntervention: number;
      etat: string | null;
    }>,
  ) {
    const etatsFermes = [
      'TERMINE',
      'TERMINEE',
      'TERMINÉ',
      'TERMINÉE',
      'CLOTURE',
      'CLOTUREE',
      'CLÔTURÉ',
      'CLÔTURÉE',
      'ANNULE',
      'ANNULEE',
      'ANNULÉ',
      'ANNULÉE',
    ];

    return interventions.some((intervention) => {
      if (!intervention.etat) return true;

      return !etatsFermes.includes(intervention.etat.toUpperCase());
    });
  }

  private async findPointMesureOrFail(idPointMesure: number) {
    const pointMesure = await this.prisma.point_mesure.findUnique({
      where: { idPointMesure },
      select: {
        idPointMesure: true,
        code: true,
        libelle: true,
        type: true,
        unite: true,
        actif: true,
        valeurMin: true,
        valeurMax: true,
        surveillanceMin: true,
        surveillanceMax: true,
        correctionMin: true,
        correctionMax: true,
        emettreDi: true,
        envoyerAlerte: true,
      },
    });

    if (!pointMesure) {
      throw new NotFoundException('Point de mesure introuvable.');
    }

    if (pointMesure.actif === false) {
      throw new BadRequestException(
        'Impossible d’ajouter un relevé sur un point de mesure inactif.',
      );
    }

    return pointMesure;
  }

  private validateValeur(
    pointMesure: {
      valeurMin: Prisma.Decimal | null;
      valeurMax: Prisma.Decimal | null;
    },
    valeur: Prisma.Decimal,
  ) {
    if (pointMesure.valeurMin && valeur.lessThan(pointMesure.valeurMin)) {
      throw new BadRequestException(
        'La valeur du relevé est inférieure à la valeur minimale autorisée.',
      );
    }

    if (pointMesure.valeurMax && valeur.greaterThan(pointMesure.valeurMax)) {
      throw new BadRequestException(
        'La valeur du relevé est supérieure à la valeur maximale autorisée.',
      );
    }
  }

  private async refreshDernierReleve(
    tx: Prisma.TransactionClient,
    idPointMesure: number,
  ) {
    const latest = await tx.releve_mesure.findFirst({
      where: { idPointMesure },
      orderBy: [{ dateReleve: 'desc' }, { idReleveMesure: 'desc' }],
    });

    await tx.point_mesure.update({
      where: { idPointMesure },
      data: {
        derniereValeur: latest?.valeur ?? null,
        derniereDate: latest?.dateReleve ?? null,
      },
    });
  }

  private parseDate(value?: string | null) {
    if (!value) {
      return new Date();
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('La date du relevé est invalide.');
    }

    return date;
  }

  private toDecimalOrNull(value?: number | string | null) {
    if (value === undefined || value === null || value === '') {
      return null;
    }

    return new Prisma.Decimal(value);
  }

  private defaultInclude() {
    return {
      point_mesure: {
        select: {
          idPointMesure: true,
          code: true,
          libelle: true,
          type: true,
          unite: true,
          derniereValeur: true,
          derniereDate: true,
        },
      },
    };
  }
}