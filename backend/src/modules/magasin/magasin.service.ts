import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMagasinDto } from './dto/create-magasin.dto';
import { UpdateMagasinDto } from './dto/update-magasin.dto';
import { CreateEmplacementMagasinDto } from './dto/create-emplacement-magasin.dto';
import { UpdateEmplacementMagasinDto } from './dto/update-emplacement-magasin.dto';

@Injectable()
export class MagasinService {
  constructor(private readonly prisma: PrismaService) {}

  /* =========================
     MAGASINS
  ========================= */

  async create(dto: CreateMagasinDto) {
    const code = dto.code.trim().toUpperCase();
    const libelle = dto.libelle.trim();

    const existing = await this.prisma.magasin.findUnique({
      where: { code },
    });

    if (existing) {
      throw new BadRequestException('Un magasin avec ce code existe déjà.');
    }

    return this.prisma.magasin.create({
      data: {
        code,
        libelle,
        actif: dto.actif ?? true,

        /*
          On crée automatiquement un emplacement par défaut.
          Comme ça, chaque magasin peut être utilisé directement
          dans les entrées/sorties même si aucun rayon n'est encore défini.
        */
        emplacements: {
          create: {
            code: 'DEFAULT',
            libelle: 'Emplacement par défaut',
            actif: true,
          },
        },
      },
      include: {
        emplacements: {
          orderBy: { code: 'asc' },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.magasin.findMany({
      orderBy: { code: 'asc' },
      include: {
        emplacements: {
          orderBy: { code: 'asc' },
        },
      },
    });
  }

  async findOne(id: number) {
    const magasin = await this.prisma.magasin.findUnique({
      where: { idMagasin: id },
      include: {
        emplacements: {
          orderBy: { code: 'asc' },
        },
      },
    });

    if (!magasin) {
      throw new NotFoundException('Magasin introuvable.');
    }

    return magasin;
  }

  async update(id: number, dto: UpdateMagasinDto) {
    await this.findOne(id);

    if (dto.code) {
      const code = dto.code.trim().toUpperCase();

      const existing = await this.prisma.magasin.findFirst({
        where: {
          code,
          NOT: { idMagasin: id },
        },
      });

      if (existing) {
        throw new BadRequestException('Un magasin avec ce code existe déjà.');
      }
    }

    return this.prisma.magasin.update({
      where: { idMagasin: id },
      data: {
        ...(dto.code !== undefined && {
          code: dto.code.trim().toUpperCase(),
        }),
        ...(dto.libelle !== undefined && {
          libelle: dto.libelle.trim(),
        }),
        ...(dto.actif !== undefined && {
          actif: dto.actif,
        }),
      },
      include: {
        emplacements: {
          orderBy: { code: 'asc' },
        },
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    const stockExists = await this.prisma.stock_article_magasin.count({
      where: { idMagasin: id },
    });

    if (stockExists > 0) {
      throw new BadRequestException(
        'Impossible de supprimer ce magasin car il contient du stock.',
      );
    }

    const lignesEntree = await this.prisma.entree_stock_ligne.count({
      where: { idMagasin: id },
    });

    const lignesSortie = await this.prisma.sortie_stock_ligne.count({
      where: { idMagasin: id },
    });

    if (lignesEntree > 0 || lignesSortie > 0) {
      throw new BadRequestException(
        'Impossible de supprimer ce magasin car il est déjà utilisé dans des mouvements de stock.',
      );
    }

    return this.prisma.magasin.delete({
      where: { idMagasin: id },
    });
  }

  /* =========================
     EMPLACEMENTS MAGASIN
  ========================= */

  async findEmplacementsByMagasin(idMagasin: number) {
    await this.findOne(idMagasin);

    return this.prisma.emplacement_magasin.findMany({
      where: { idMagasin },
      orderBy: { code: 'asc' },
    });
  }

  async createEmplacement(
    idMagasin: number,
    dto: CreateEmplacementMagasinDto,
  ) {
    await this.findOne(idMagasin);

    const code = dto.code.trim().toUpperCase();
    const libelle = dto.libelle.trim();

    const existing = await this.prisma.emplacement_magasin.findFirst({
      where: {
        idMagasin,
        code,
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Un emplacement avec ce code existe déjà dans ce magasin.',
      );
    }

    return this.prisma.emplacement_magasin.create({
      data: {
        idMagasin,
        code,
        libelle,
        actif: dto.actif ?? true,
      },
      include: {
        magasin: true,
      },
    });
  }

  async findOneEmplacement(idEmplacement: number) {
    const emplacement = await this.prisma.emplacement_magasin.findUnique({
      where: { idEmplacement },
      include: {
        magasin: true,
      },
    });

    if (!emplacement) {
      throw new NotFoundException('Emplacement introuvable.');
    }

    return emplacement;
  }

  async updateEmplacement(
    idEmplacement: number,
    dto: UpdateEmplacementMagasinDto,
  ) {
    const emplacement = await this.findOneEmplacement(idEmplacement);

    if (dto.code) {
      const code = dto.code.trim().toUpperCase();

      const existing = await this.prisma.emplacement_magasin.findFirst({
        where: {
          idMagasin: emplacement.idMagasin,
          code,
          NOT: { idEmplacement },
        },
      });

      if (existing) {
        throw new BadRequestException(
          'Un emplacement avec ce code existe déjà dans ce magasin.',
        );
      }
    }

    return this.prisma.emplacement_magasin.update({
      where: { idEmplacement },
      data: {
        ...(dto.code !== undefined && {
          code: dto.code.trim().toUpperCase(),
        }),
        ...(dto.libelle !== undefined && {
          libelle: dto.libelle.trim(),
        }),
        ...(dto.actif !== undefined && {
          actif: dto.actif,
        }),
      },
      include: {
        magasin: true,
      },
    });
  }

  async removeEmplacement(idEmplacement: number) {
    const emplacement = await this.findOneEmplacement(idEmplacement);

    const lignesEntree = await this.prisma.entree_stock_ligne.count({
      where: { idEmplacement },
    });

    const lignesSortie = await this.prisma.sortie_stock_ligne.count({
      where: { idEmplacement },
    });

    /*
      Si l'emplacement est déjà utilisé, on ne le supprime pas physiquement.
      On le désactive pour garder l'historique propre.
    */
    if (lignesEntree > 0 || lignesSortie > 0) {
      return this.prisma.emplacement_magasin.update({
        where: { idEmplacement },
        data: { actif: false },
        include: {
          magasin: true,
        },
      });
    }

    /*
      Même s'il n'est pas encore utilisé, on peut aussi préférer
      la désactivation pour éviter les suppressions accidentelles.
    */
    return this.prisma.emplacement_magasin.update({
      where: { idEmplacement: emplacement.idEmplacement },
      data: { actif: false },
      include: {
        magasin: true,
      },
    });
  }
}