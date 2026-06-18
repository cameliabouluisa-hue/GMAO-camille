import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateDemandeTransfertDto } from './dto/create-demande-transfert.dto';

@Injectable()
export class DemandesTransfertService {
  constructor(private readonly prisma: PrismaService) {}

  private includeDemande() {
    return {
      magasinSource: true,
      magasinDestination: true,
      lignes: {
        include: {
          article: true,
        },
        orderBy: {
          idLigneDemandeTransfertStock: 'asc' as const,
        },
      },
    };
  }

  private toNumber(value: unknown): number {
    return Number(value ?? 0);
  }

  async findAll() {
    return this.prisma.demande_transfert_stock.findMany({
      include: this.includeDemande(),
      orderBy: {
        dateDemande: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const demande = await this.prisma.demande_transfert_stock.findUnique({
      where: {
        idDemandeTransfertStock: id,
      },
      include: this.includeDemande(),
    });

    if (!demande) {
      throw new NotFoundException('Demande de transfert introuvable.');
    }

    return demande;
  }

  async stockDisponible() {
    return this.prisma.stock_article_magasin.findMany({
      where: {
        quantiteDisponible: {
          gt: 0,
        },
        article: {
          actif: true,
          gereEnStock: true,
        },
        magasin: {
          actif: true,
        },
      },
      include: {
        article: {
          include: {
            uniteArticle: true,
            famille: true,
          },
        },
        magasin: true,
      },
      orderBy: [
        {
          magasin: {
            code: 'asc',
          },
        },
        {
          article: {
            reference: 'asc',
          },
        },
      ],
    });
  }

  async create(dto: CreateDemandeTransfertDto) {
    if (dto.idMagasinSource === dto.idMagasinDestination) {
      throw new BadRequestException(
        'Le magasin source et le magasin destination doivent être différents.',
      );
    }

    if (!dto.lignes?.length) {
      throw new BadRequestException('La demande doit contenir au moins une ligne.');
    }

    const lignesMap = new Map<
      number,
      {
        idArticle: number;
        quantite: number;
        commentaire?: string;
      }
    >();

    for (const ligne of dto.lignes) {
      if (!ligne.idArticle || ligne.quantite <= 0) {
        throw new BadRequestException(
          'Chaque ligne doit contenir un article et une quantité positive.',
        );
      }

      const existing = lignesMap.get(ligne.idArticle);

      if (existing) {
        existing.quantite += Number(ligne.quantite);
      } else {
        lignesMap.set(ligne.idArticle, {
          idArticle: Number(ligne.idArticle),
          quantite: Number(ligne.quantite),
          commentaire: ligne.commentaire?.trim() || undefined,
        });
      }
    }

    const lignes = Array.from(lignesMap.values());

    return this.prisma.$transaction(async (tx) => {
      const magasins = await tx.magasin.findMany({
        where: {
          idMagasin: {
            in: [dto.idMagasinSource, dto.idMagasinDestination],
          },
          actif: true,
        },
      });

      if (magasins.length !== 2) {
        throw new BadRequestException(
          'Magasin source ou magasin destination introuvable.',
        );
      }

      const articles = await tx.article.findMany({
        where: {
          idArticle: {
            in: lignes.map((ligne) => ligne.idArticle),
          },
          actif: true,
          gereEnStock: true,
        },
      });

      if (articles.length !== lignes.length) {
        throw new BadRequestException(
          'Un ou plusieurs articles sont introuvables ou non gérés en stock.',
        );
      }

      const count = await tx.demande_transfert_stock.count();

      const numero = `DT-${new Date().getFullYear()}-${String(
        count + 1,
      ).padStart(4, '0')}`;

      return tx.demande_transfert_stock.create({
        data: {
          numero,
          statut: 'EN_ATTENTE',
          idMagasinSource: dto.idMagasinSource,
          idMagasinDestination: dto.idMagasinDestination,
          demandeur: dto.demandeur?.trim() || null,
          commentaire: dto.commentaire?.trim() || null,
          lignes: {
            create: lignes.map((ligne) => ({
              idArticle: ligne.idArticle,
              quantite: ligne.quantite,
              commentaire: ligne.commentaire || null,
            })),
          },
        },
        include: this.includeDemande(),
      });
    });
  }

  async valider(id: number) {
    return this.prisma.$transaction(async (tx) => {
      const demande = await tx.demande_transfert_stock.findUnique({
        where: {
          idDemandeTransfertStock: id,
        },
        include: {
          lignes: true,
        },
      });

      if (!demande) {
        throw new NotFoundException('Demande de transfert introuvable.');
      }

      if (demande.statut !== 'EN_ATTENTE') {
        throw new BadRequestException(
          'Seule une demande en attente peut être validée.',
        );
      }

      for (const ligne of demande.lignes) {
        const quantite = this.toNumber(ligne.quantite);

        const stockSource = await tx.stock_article_magasin.findUnique({
          where: {
            idArticle_idMagasin: {
              idArticle: ligne.idArticle,
              idMagasin: demande.idMagasinSource,
            },
          },
        });

        if (!stockSource) {
          throw new BadRequestException(
            `Stock source introuvable pour l’article ${ligne.idArticle}.`,
          );
        }

        const disponible = this.toNumber(stockSource.quantiteDisponible);

        if (disponible < quantite) {
          throw new BadRequestException(
            `Stock disponible insuffisant pour l’article ${ligne.idArticle}. Disponible : ${disponible}.`,
          );
        }

        await tx.stock_article_magasin.update({
          where: {
            idStock: stockSource.idStock,
          },
          data: {
            quantiteReservee: {
              increment: quantite,
            },
            quantiteDisponible: {
              decrement: quantite,
            },
          },
        });
      }

      return tx.demande_transfert_stock.update({
        where: {
          idDemandeTransfertStock: id,
        },
        data: {
          statut: 'VALIDEE',
          dateValidation: new Date(),
        },
        include: this.includeDemande(),
      });
    });
  }

  async executer(id: number) {
    return this.prisma.$transaction(async (tx) => {
      const demande = await tx.demande_transfert_stock.findUnique({
        where: {
          idDemandeTransfertStock: id,
        },
        include: {
          lignes: true,
        },
      });

      if (!demande) {
        throw new NotFoundException('Demande de transfert introuvable.');
      }

      if (demande.statut !== 'VALIDEE') {
        throw new BadRequestException(
          'Seule une demande validée peut être exécutée.',
        );
      }

      for (const ligne of demande.lignes) {
        const quantite = this.toNumber(ligne.quantite);

        await tx.stock_article_magasin.update({
          where: {
            idArticle_idMagasin: {
              idArticle: ligne.idArticle,
              idMagasin: demande.idMagasinSource,
            },
          },
          data: {
            quantitePhysique: {
              decrement: quantite,
            },
            quantiteReservee: {
              decrement: quantite,
            },
          },
        });

        await tx.stock_article_magasin.upsert({
          where: {
            idArticle_idMagasin: {
              idArticle: ligne.idArticle,
              idMagasin: demande.idMagasinDestination,
            },
          },
          update: {
            quantitePhysique: {
              increment: quantite,
            },
            quantiteDisponible: {
              increment: quantite,
            },
          },
          create: {
            idArticle: ligne.idArticle,
            idMagasin: demande.idMagasinDestination,
            quantitePhysique: quantite,
            quantiteReservee: 0,
            quantiteDisponible: quantite,
          },
        });

        await tx.mouvement_stock.create({
          data: {
            typeMouvement: 'TRANSFERT',
            quantite,
            idArticle: ligne.idArticle,
            idMagasinSource: demande.idMagasinSource,
            idMagasinDestination: demande.idMagasinDestination,
            origineType: 'DEMANDE_TRANSFERT',
            origineId: demande.idDemandeTransfertStock,
            commentaire:
              ligne.commentaire ||
              demande.commentaire ||
              `Transfert ${demande.numero}`,
          },
        });
      }

      return tx.demande_transfert_stock.update({
        where: {
          idDemandeTransfertStock: id,
        },
        data: {
          statut: 'EXECUTEE',
          dateExecution: new Date(),
        },
        include: this.includeDemande(),
      });
    });
  }

  async annuler(id: number) {
    return this.prisma.$transaction(async (tx) => {
      const demande = await tx.demande_transfert_stock.findUnique({
        where: {
          idDemandeTransfertStock: id,
        },
        include: {
          lignes: true,
        },
      });

      if (!demande) {
        throw new NotFoundException('Demande de transfert introuvable.');
      }

      if (demande.statut === 'EXECUTEE') {
        throw new BadRequestException(
          'Une demande déjà exécutée ne peut pas être annulée.',
        );
      }

      if (demande.statut === 'ANNULEE') {
        throw new BadRequestException('Cette demande est déjà annulée.');
      }

      if (demande.statut === 'VALIDEE') {
        for (const ligne of demande.lignes) {
          const quantite = this.toNumber(ligne.quantite);

          await tx.stock_article_magasin.update({
            where: {
              idArticle_idMagasin: {
                idArticle: ligne.idArticle,
                idMagasin: demande.idMagasinSource,
              },
            },
            data: {
              quantiteReservee: {
                decrement: quantite,
              },
              quantiteDisponible: {
                increment: quantite,
              },
            },
          });
        }
      }

      return tx.demande_transfert_stock.update({
        where: {
          idDemandeTransfertStock: id,
        },
        data: {
          statut: 'ANNULEE',
          dateAnnulation: new Date(),
        },
        include: this.includeDemande(),
      });
    });
  }

  async remove(id: number) {
    const demande = await this.findOne(id);

    if (!['EN_ATTENTE', 'ANNULEE'].includes(demande.statut)) {
      throw new BadRequestException(
        'Seules les demandes en attente ou annulées peuvent être supprimées.',
      );
    }

    return this.prisma.demande_transfert_stock.delete({
      where: {
        idDemandeTransfertStock: id,
      },
    });
  }
}