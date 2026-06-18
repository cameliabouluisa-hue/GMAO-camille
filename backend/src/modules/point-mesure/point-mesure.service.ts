import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '../../../generated/prisma/client';

import { CreatePointMesureDto } from './dto/create-point-mesure.dto';
import { UpdatePointMesureDto } from './dto/update-point-mesure.dto';

type PointMesureFilters = {
  search?: string;
  type?: string;
  actif?: boolean;
  idPointStructure?: number;
  idMateriel?: number;
};

@Injectable()
export class PointMesureService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePointMesureDto) {
    this.validateLienUnique(dto.idPointStructure, dto.idMateriel);
    this.validateParametresMesure(dto);

    await this.validateRelationsExist(dto.idPointStructure, dto.idMateriel);

    try {
      return await this.prisma.point_mesure.create({
        data: {
          code: this.normalizeCode(dto.code),
          libelle: dto.libelle.trim(),
          type: dto.type,
          unite: dto.unite?.trim() || null,
          organisation: dto.organisation?.trim() || null,

          idPointStructure: dto.idPointStructure ?? null,
          idMateriel: dto.idMateriel ?? null,

          valeurMin: this.toDecimalOrNull(dto.valeurMin),
          valeurMax: this.toDecimalOrNull(dto.valeurMax),
          nbDecimales: dto.nbDecimales ?? 2,
          periodeReleveJours: dto.periodeReleveJours ?? null,

          surveillanceMin: this.toDecimalOrNull(dto.surveillanceMin),
          surveillanceMax: this.toDecimalOrNull(dto.surveillanceMax),
          correctionMin: this.toDecimalOrNull(dto.correctionMin),
          correctionMax: this.toDecimalOrNull(dto.correctionMax),

          emettreDi: dto.emettreDi ?? false,
          envoyerAlerte: dto.envoyerAlerte ?? false,

          actif: dto.actif ?? true,
        },
        include: this.defaultInclude(),
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll(filters: PointMesureFilters) {
    const where: Prisma.point_mesureWhereInput = {};

    if (filters.search) {
      const search = filters.search.trim();

      where.OR = [
        { code: { contains: search } },
        { libelle: { contains: search } },
        { organisation: { contains: search } },
      ];
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.actif !== undefined) {
      where.actif = filters.actif;
    }

    if (filters.idPointStructure !== undefined) {
      where.idPointStructure = filters.idPointStructure;
    }

    if (filters.idMateriel !== undefined) {
      where.idMateriel = filters.idMateriel;
    }

    return this.prisma.point_mesure.findMany({
      where,
      orderBy: [{ actif: 'desc' }, { code: 'asc' }],
      include: this.defaultInclude(),
    });
  }

  async findOne(idPointMesure: number) {
    const pointMesure = await this.prisma.point_mesure.findUnique({
      where: { idPointMesure },
      include: {
        ...this.defaultInclude(),
        releves: {
          orderBy: [
            { dateReleve: 'desc' },
            { idReleveMesure: 'desc' },
          ],
          take: 20,
        },
      },
    });

    if (!pointMesure) {
      throw new NotFoundException('Point de mesure introuvable.');
    }

    return pointMesure;
  }

  async update(idPointMesure: number, dto: UpdatePointMesureDto) {
    const existing = await this.prisma.point_mesure.findUnique({
      where: { idPointMesure },
    });

    if (!existing) {
      throw new NotFoundException('Point de mesure introuvable.');
    }

    const finalIdPointStructure =
      dto.idPointStructure !== undefined
        ? dto.idPointStructure
        : existing.idPointStructure;

    const finalIdMateriel =
      dto.idMateriel !== undefined ? dto.idMateriel : existing.idMateriel;

    this.validateLienUnique(finalIdPointStructure, finalIdMateriel);
    this.validateParametresMesure({
      valeurMin:
        dto.valeurMin !== undefined
          ? dto.valeurMin
          : this.decimalToNumberOrNull(existing.valeurMin),

      valeurMax:
        dto.valeurMax !== undefined
          ? dto.valeurMax
          : this.decimalToNumberOrNull(existing.valeurMax),

      surveillanceMin:
        dto.surveillanceMin !== undefined
          ? dto.surveillanceMin
          : this.decimalToNumberOrNull(existing.surveillanceMin),

      surveillanceMax:
        dto.surveillanceMax !== undefined
          ? dto.surveillanceMax
          : this.decimalToNumberOrNull(existing.surveillanceMax),

      correctionMin:
        dto.correctionMin !== undefined
          ? dto.correctionMin
          : this.decimalToNumberOrNull(existing.correctionMin),

      correctionMax:
        dto.correctionMax !== undefined
          ? dto.correctionMax
          : this.decimalToNumberOrNull(existing.correctionMax),

      nbDecimales:
        dto.nbDecimales !== undefined ? dto.nbDecimales : existing.nbDecimales,

      periodeReleveJours:
        dto.periodeReleveJours !== undefined
          ? dto.periodeReleveJours
          : existing.periodeReleveJours,
    });

    await this.validateRelationsExist(finalIdPointStructure, finalIdMateriel);

    try {
      return await this.prisma.point_mesure.update({
        where: { idPointMesure },
        data: {
          ...(dto.code !== undefined && {
            code: this.normalizeCode(dto.code),
          }),

          ...(dto.libelle !== undefined && {
            libelle: dto.libelle.trim(),
          }),

          ...(dto.type !== undefined && {
            type: dto.type,
          }),

          ...(dto.unite !== undefined && {
            unite: dto.unite?.trim() || null,
          }),

          ...(dto.organisation !== undefined && {
            organisation: dto.organisation?.trim() || null,
          }),

          ...(dto.idPointStructure !== undefined && {
            idPointStructure: dto.idPointStructure,
          }),

          ...(dto.idMateriel !== undefined && {
            idMateriel: dto.idMateriel,
          }),

          ...(dto.valeurMin !== undefined && {
            valeurMin: this.toDecimalOrNull(dto.valeurMin),
          }),

          ...(dto.valeurMax !== undefined && {
            valeurMax: this.toDecimalOrNull(dto.valeurMax),
          }),

          ...(dto.nbDecimales !== undefined && {
            nbDecimales: dto.nbDecimales,
          }),

          ...(dto.periodeReleveJours !== undefined && {
            periodeReleveJours: dto.periodeReleveJours,
          }),

          ...(dto.surveillanceMin !== undefined && {
            surveillanceMin: this.toDecimalOrNull(dto.surveillanceMin),
          }),

          ...(dto.surveillanceMax !== undefined && {
            surveillanceMax: this.toDecimalOrNull(dto.surveillanceMax),
          }),

          ...(dto.correctionMin !== undefined && {
            correctionMin: this.toDecimalOrNull(dto.correctionMin),
          }),

          ...(dto.correctionMax !== undefined && {
            correctionMax: this.toDecimalOrNull(dto.correctionMax),
          }),

          ...(dto.emettreDi !== undefined && {
            emettreDi: dto.emettreDi,
          }),

          ...(dto.envoyerAlerte !== undefined && {
            envoyerAlerte: dto.envoyerAlerte,
          }),

          ...(dto.actif !== undefined && {
            actif: dto.actif,
          }),
        },
        include: this.defaultInclude(),
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(idPointMesure: number) {
    const existing = await this.prisma.point_mesure.findUnique({
      where: { idPointMesure },
      select: { idPointMesure: true },
    });

    if (!existing) {
      throw new NotFoundException('Point de mesure introuvable.');
    }

    return this.prisma.point_mesure.update({
      where: { idPointMesure },
      data: { actif: false },
      include: this.defaultInclude(),
    });
  }

  async restore(idPointMesure: number) {
    const existing = await this.prisma.point_mesure.findUnique({
      where: { idPointMesure },
      select: { idPointMesure: true },
    });

    if (!existing) {
      throw new NotFoundException('Point de mesure introuvable.');
    }

    return this.prisma.point_mesure.update({
      where: { idPointMesure },
      data: { actif: true },
      include: this.defaultInclude(),
    });
  }

  private normalizeCode(code: string) {
    return code.trim().toUpperCase();
  }

  private toDecimalOrNull(value?: number | string | null) {
    if (value === undefined || value === null || value === '') {
      return null;
    }

    return new Prisma.Decimal(value);
  }

  private decimalToNumberOrNull(value?: Prisma.Decimal | null) {
    if (value === undefined || value === null) {
      return null;
    }

    return Number(value);
  }

  private validateLienUnique(
    idPointStructure?: number | null,
    idMateriel?: number | null,
  ) {
    const hasPointStructure =
      idPointStructure !== undefined && idPointStructure !== null;

    const hasMateriel = idMateriel !== undefined && idMateriel !== null;

    if (hasPointStructure && hasMateriel) {
      throw new BadRequestException(
        'Un point de mesure doit être lié soit à un point de structure, soit à un matériel, pas les deux.',
      );
    }

    if (!hasPointStructure && !hasMateriel) {
      throw new BadRequestException(
        'Un point de mesure doit être lié à un point de structure ou à un matériel.',
      );
    }
  }

  private validateParametresMesure(data: {
    valeurMin?: number | string | null;
    valeurMax?: number | string | null;
    nbDecimales?: number | null;
    periodeReleveJours?: number | null;
    surveillanceMin?: number | string | null;
    surveillanceMax?: number | string | null;
    correctionMin?: number | string | null;
    correctionMax?: number | string | null;
  }) {
    this.validateMinMax(
      data.valeurMin,
      data.valeurMax,
      'La valeur minimale ne peut pas être supérieure à la valeur maximale.',
    );

    this.validateMinMax(
      data.surveillanceMin,
      data.surveillanceMax,
      'Le seuil de surveillance minimum ne peut pas être supérieur au seuil de surveillance maximum.',
    );

    this.validateMinMax(
      data.correctionMin,
      data.correctionMax,
      'Le seuil de correction minimum ne peut pas être supérieur au seuil de correction maximum.',
    );

    if (
      data.nbDecimales !== undefined &&
      data.nbDecimales !== null &&
      data.nbDecimales < 0
    ) {
      throw new BadRequestException(
        'Le nombre de décimales ne peut pas être négatif.',
      );
    }

    if (
      data.periodeReleveJours !== undefined &&
      data.periodeReleveJours !== null &&
      data.periodeReleveJours < 0
    ) {
      throw new BadRequestException(
        'La période des relevés ne peut pas être négative.',
      );
    }
  }

  private validateMinMax(
    min?: number | string | null,
    max?: number | string | null,
    message?: string,
  ) {
    if (min === undefined || min === null || min === '') return;
    if (max === undefined || max === null || max === '') return;

    if (Number(min) > Number(max)) {
      throw new BadRequestException(message || 'Valeurs min/max invalides.');
    }
  }

  private async validateRelationsExist(
    idPointStructure?: number | null,
    idMateriel?: number | null,
  ) {
    if (idPointStructure !== undefined && idPointStructure !== null) {
      const pointStructure = await this.prisma.point_structure.findUnique({
        where: { idPoint: idPointStructure },
        select: { idPoint: true },
      });

      if (!pointStructure) {
        throw new NotFoundException('Point de structure introuvable.');
      }
    }

    if (idMateriel !== undefined && idMateriel !== null) {
      const materiel = await this.prisma.materiel.findUnique({
        where: { idMateriel },
        select: { idMateriel: true },
      });

      if (!materiel) {
        throw new NotFoundException('Matériel introuvable.');
      }
    }
  }

  private defaultInclude() {
    return {
      point_structure: {
        select: {
          idPoint: true,
          code: true,
          libelle: true,
          typePoint: true,
          actif: true,
        },
      },

      materiel: {
        select: {
          idMateriel: true,
          code: true,
          numeroSerie: true,
          actif: true,
          modele: {
            select: {
              idModele: true,
              code: true,
              libelle: true,
            },
          },
        },
      },

      _count: {
        select: {
          releves: true,
        },
      },
    };
  }

  private handlePrismaError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('Ce code de point de mesure existe déjà.');
    }

    throw error;
  }
}