import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateReapprovisionnementDto } from './dto/create-reapprovisionnement.dto';

@Injectable()
export class ReapprovisionnementService {
  constructor(private readonly prisma: PrismaService) {}

  private includeDemande() {
    return {
      magasin: true,
      lignes: {
        include: {
          article: true,
        },
        orderBy: {
          idLigneReapprovisionnement: 'asc' as const,
        },
      },
    };
  }

  private toNumber(value: unknown): number {
    if (value === null || value === undefined) return 0;

    const n = Number(value);

    if (Number.isNaN(n)) return 0;

    return Number(n.toFixed(2));
  }

  private normalizeDemande(demande: any) {
    if (!demande) return demande;

    return {
      ...demande,
      lignes:
        demande.lignes?.map((ligne: any) => ({
          ...ligne,
          quantiteDemandee: this.toNumber(ligne.quantiteDemandee),
        })) ?? [],
    };
  }

  private normalizeStock(stock: any) {
    const quantitePhysique = this.toNumber(stock.quantitePhysique);
    const quantiteReservee = this.toNumber(stock.quantiteReservee);
    const quantiteDisponible = this.toNumber(
      stock.quantiteDisponible ?? quantitePhysique - quantiteReservee,
    );

    return {
      ...stock,
      quantitePhysique,
      quantiteReservee,
      quantiteDisponible,
    };
  }

  async findAll() {
    const demandes =
      await this.prisma.demande_reapprovisionnement.findMany({
        include: this.includeDemande(),
        orderBy: {
          idDemandeReapprovisionnement: 'desc',
        },
      });

    return demandes.map((demande) => this.normalizeDemande(demande));
  }

  async findOne(id: number) {
    const demande =
      await this.prisma.demande_reapprovisionnement.findUnique({
        where: {
          idDemandeReapprovisionnement: id,
        },
        include: this.includeDemande(),
      });

    if (!demande) {
      throw new NotFoundException('Demande de réapprovisionnement introuvable.');
    }

    return this.normalizeDemande(demande);
  }

  async getStockDisponible(idMagasin?: number) {
    const stocks = await this.prisma.stock_article_magasin.findMany({
      where: idMagasin
        ? {
            idMagasin,
          }
        : {},
      include: {
        article: true,
        magasin: true,
      },
      orderBy: [
        {
          idMagasin: 'asc',
        },
        {
          idArticle: 'asc',
        },
      ],
    });

    return stocks.map((stock) => this.normalizeStock(stock));
  }

  async getSuggestionsStockBas(seuil = 5, idMagasin?: number) {
    const stocks = await this.getStockDisponible(idMagasin);

    return stocks
      .filter((stock: any) => stock.quantiteDisponible <= seuil)
      .map((stock: any) => ({
        ...stock,
        seuil,
        quantiteSuggeree: Math.max(1, Number((seuil * 2 - stock.quantiteDisponible).toFixed(2))),
      }));
  }

  async create(dto: CreateReapprovisionnementDto) {
    const magasin = await this.prisma.magasin.findUnique({
      where: {
        idMagasin: dto.idMagasin,
      },
    });

    if (!magasin) {
      throw new NotFoundException('Magasin introuvable.');
    }

    if (!dto.lignes || dto.lignes.length === 0) {
      throw new BadRequestException('Ajoutez au moins une ligne.');
    }

    const lignesMap = new Map<
      number,
      {
        idArticle: number;
        quantiteDemandee: number;
        commentaire?: string;
      }
    >();

    for (const ligne of dto.lignes) {
      const quantite = Number(ligne.quantiteDemandee);

      if (!ligne.idArticle || quantite <= 0) {
        throw new BadRequestException(
          'Chaque ligne doit contenir un article et une quantité valide.',
        );
      }

      const existing = lignesMap.get(ligne.idArticle);

      if (existing) {
        existing.quantiteDemandee = Number(
          (existing.quantiteDemandee + quantite).toFixed(2),
        );
      } else {
        lignesMap.set(ligne.idArticle, {
          idArticle: ligne.idArticle,
          quantiteDemandee: quantite,
          commentaire: ligne.commentaire?.trim() || undefined,
        });
      }
    }

    const lignes = Array.from(lignesMap.values());
    const idsArticles = lignes.map((ligne) => ligne.idArticle);

    const articlesExistants = await this.prisma.article.count({
      where: {
        idArticle: {
          in: idsArticles,
        },
      },
    });

    if (articlesExistants !== idsArticles.length) {
      throw new NotFoundException(
        'Un ou plusieurs articles sont introuvables.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const count = await tx.demande_reapprovisionnement.count();

      const numero = `DR-${new Date().getFullYear()}-${String(
        count + 1,
      ).padStart(4, '0')}`;

      const demande = await tx.demande_reapprovisionnement.create({
        data: {
          numero,
          idMagasin: dto.idMagasin,
          demandeur: dto.demandeur?.trim() || null,
          commentaire: dto.commentaire?.trim() || null,
          statut: 'BROUILLON',
        },
      });

      await tx.ligne_reapprovisionnement.createMany({
        data: lignes.map((ligne) => ({
          idDemandeReapprovisionnement:
            demande.idDemandeReapprovisionnement,
          idArticle: ligne.idArticle,
          quantiteDemandee: ligne.quantiteDemandee,
          commentaire: ligne.commentaire || null,
        })),
      });

      const created =
        await tx.demande_reapprovisionnement.findUnique({
          where: {
            idDemandeReapprovisionnement:
              demande.idDemandeReapprovisionnement,
          },
          include: this.includeDemande(),
        });

      return this.normalizeDemande(created);
    });
  }

  async valider(id: number) {
    const demande = await this.findOne(id);

    if (demande.statut === 'ANNULEE') {
      throw new BadRequestException(
        'Impossible de valider une demande annulée.',
      );
    }

    if (demande.statut === 'VALIDEE') {
      return demande;
    }

    const updated =
      await this.prisma.demande_reapprovisionnement.update({
        where: {
          idDemandeReapprovisionnement: id,
        },
        data: {
          statut: 'VALIDEE',
          dateValidation: new Date(),
        },
        include: this.includeDemande(),
      });

    return this.normalizeDemande(updated);
  }

  async annuler(id: number) {
    const demande = await this.findOne(id);

    if (demande.statut === 'VALIDEE') {
      throw new BadRequestException(
        'Impossible d’annuler une demande déjà validée.',
      );
    }

    if (demande.statut === 'ANNULEE') {
      return demande;
    }

    const updated =
      await this.prisma.demande_reapprovisionnement.update({
        where: {
          idDemandeReapprovisionnement: id,
        },
        data: {
          statut: 'ANNULEE',
          dateAnnulation: new Date(),
        },
        include: this.includeDemande(),
      });

    return this.normalizeDemande(updated);
  }

  async remove(id: number) {
    const demande = await this.findOne(id);

    if (demande.statut === 'VALIDEE') {
      throw new BadRequestException(
        'Impossible de supprimer une demande validée.',
      );
    }

    await this.prisma.demande_reapprovisionnement.delete({
      where: {
        idDemandeReapprovisionnement: id,
      },
    });

    return {
      message: 'Demande de réapprovisionnement supprimée avec succès.',
    };
  }
}