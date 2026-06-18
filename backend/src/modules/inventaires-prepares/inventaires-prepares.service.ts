import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateInventairePrepareDto } from './dto/create-inventaire-prepare.dto';
import { AddLigneInventaireDto } from './dto/add-ligne-inventaire.dto';
import { SaisirQuantitesDto } from './dto/saisir-quantites.dto';

@Injectable()
export class InventairesPreparesService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly inventaireInclude = {
    magasin: true,
    lignes: {
      include: {
        article: true,
      },
      orderBy: {
        idLigneInventairePrepare: 'asc',
      },
    },
  } as const;

  async findAll() {
    return this.prisma.inventairePrepare.findMany({
      include: this.inventaireInclude,
      orderBy: {
        idInventairePrepare: 'desc',
      },
    });
  }

  async findOne(idInventairePrepare: number) {
    const inventaire = await this.prisma.inventairePrepare.findUnique({
      where: { idInventairePrepare },
      include: this.inventaireInclude,
    });

    if (!inventaire) {
      throw new NotFoundException('Inventaire préparé introuvable.');
    }

    return inventaire;
  }

  private async generateNumero() {
    const year = new Date().getFullYear();

    const count = await this.prisma.inventairePrepare.count({
      where: {
        numero: {
          startsWith: `INV-PREP-${year}-`,
        },
      },
    });

    const next = String(count + 1).padStart(4, '0');

    return `INV-PREP-${year}-${next}`;
  }

  async create(dto: CreateInventairePrepareDto) {
    const magasin = await this.prisma.magasin.findUnique({
      where: {
        idMagasin: Number(dto.idMagasin),
      },
    });

    if (!magasin) {
      throw new NotFoundException('Magasin introuvable.');
    }

    const inventaire = await this.prisma.inventairePrepare.create({
      data: {
        numero: await this.generateNumero(),
        idMagasin: Number(dto.idMagasin),
        commentaire: dto.commentaire ?? null,
        statut: 'BROUILLON',
      },
      include: this.inventaireInclude,
    });

    if (dto.genererDepuisStock) {
      await this.genererLignesDepuisStock(inventaire.idInventairePrepare);
    }

    return this.findOne(inventaire.idInventairePrepare);
  }

  async addLigne(
    idInventairePrepare: number,
    dto: AddLigneInventaireDto,
  ) {
    const inventaire = await this.findOne(idInventairePrepare);

    if (inventaire.statut !== 'BROUILLON') {
      throw new BadRequestException(
        'Vous pouvez ajouter des lignes seulement si l’inventaire est en brouillon.',
      );
    }

    const article = await this.prisma.article.findUnique({
      where: {
        idArticle: Number(dto.idArticle),
      },
    });

    if (!article) {
      throw new NotFoundException('Article introuvable.');
    }

    const stock = await this.prisma.stock_article_magasin.findFirst({
      where: {
        idMagasin: inventaire.idMagasin,
        idArticle: Number(dto.idArticle),
      },
    });

    const quantiteTheorique =
      dto.quantiteTheorique !== undefined
        ? Number(dto.quantiteTheorique)
        : Number(stock?.quantitePhysique ?? 0);

    const ligneExistante =
      await this.prisma.ligneInventairePrepare.findFirst({
        where: {
          idInventairePrepare,
          idArticle: Number(dto.idArticle),
        },
      });

    if (ligneExistante) {
      return this.prisma.ligneInventairePrepare.update({
        where: {
          idLigneInventairePrepare:
            ligneExistante.idLigneInventairePrepare,
        },
        data: {
          quantiteTheorique,
          commentaire: dto.commentaire ?? ligneExistante.commentaire,
        },
        include: {
          article: true,
        },
      });
    }

    return this.prisma.ligneInventairePrepare.create({
      data: {
        idInventairePrepare,
        idArticle: Number(dto.idArticle),
        quantiteTheorique,
        commentaire: dto.commentaire ?? null,
      },
      include: {
        article: true,
      },
    });
  }

  async genererLignesDepuisStock(idInventairePrepare: number) {
    const inventaire = await this.findOne(idInventairePrepare);

    if (inventaire.statut !== 'BROUILLON') {
      throw new BadRequestException(
        'La génération automatique est possible seulement en brouillon.',
      );
    }

    const stocks = await this.prisma.stock_article_magasin.findMany({
      where: {
        idMagasin: inventaire.idMagasin,
        quantitePhysique: {
          gt: 0,
        },
      },
      include: {
        article: true,
      },
    });

    for (const stock of stocks) {
      const ligneExistante =
        await this.prisma.ligneInventairePrepare.findFirst({
          where: {
            idInventairePrepare,
            idArticle: stock.idArticle,
          },
        });

      if (ligneExistante) {
        await this.prisma.ligneInventairePrepare.update({
          where: {
            idLigneInventairePrepare:
              ligneExistante.idLigneInventairePrepare,
          },
          data: {
            quantiteTheorique: Number(stock.quantitePhysique),
          },
        });
      } else {
        await this.prisma.ligneInventairePrepare.create({
          data: {
            idInventairePrepare,
            idArticle: stock.idArticle,
            quantiteTheorique: Number(stock.quantitePhysique),
          },
        });
      }
    }

    return this.findOne(idInventairePrepare);
  }

  async lancerComptage(idInventairePrepare: number) {
    const inventaire = await this.findOne(idInventairePrepare);

    if (inventaire.statut !== 'BROUILLON') {
      throw new BadRequestException(
        'Seul un inventaire en brouillon peut être lancé en comptage.',
      );
    }

    if (inventaire.lignes.length === 0) {
      throw new BadRequestException(
        'Impossible de lancer le comptage sans lignes d’inventaire.',
      );
    }

    return this.prisma.inventairePrepare.update({
      where: {
        idInventairePrepare,
      },
      data: {
        statut: 'EN_COMPTAGE',
        dateComptage: new Date(),
      },
      include: this.inventaireInclude,
    });
  }

  async saisirQuantites(
    idInventairePrepare: number,
    dto: SaisirQuantitesDto,
  ) {
    const inventaire = await this.findOne(idInventairePrepare);

    if (inventaire.statut !== 'EN_COMPTAGE') {
      throw new BadRequestException(
        'La saisie des quantités est possible seulement en comptage.',
      );
    }

    if (!dto.lignes || dto.lignes.length === 0) {
      throw new BadRequestException(
        'Vous devez envoyer au moins une ligne à saisir.',
      );
    }

    for (const ligne of dto.lignes) {
      const existingLine = inventaire.lignes.find(
        (item) =>
          item.idLigneInventairePrepare ===
          Number(ligne.idLigneInventairePrepare),
      );

      if (!existingLine) {
        throw new NotFoundException(
          `Ligne ${ligne.idLigneInventairePrepare} introuvable dans cet inventaire.`,
        );
      }

      const quantiteReelle = Number(ligne.quantiteReelle);
      const quantiteTheorique = Number(existingLine.quantiteTheorique);
      const ecart = quantiteReelle - quantiteTheorique;

      await this.prisma.ligneInventairePrepare.update({
        where: {
          idLigneInventairePrepare:
            existingLine.idLigneInventairePrepare,
        },
        data: {
          quantiteReelle,
          ecart,
          commentaire: ligne.commentaire ?? existingLine.commentaire,
        },
      });
    }

    return this.findOne(idInventairePrepare);
  }
async calculerEcarts(idInventairePrepare: number) {
  const inventaire = await this.findOne(idInventairePrepare);

  if (inventaire.statut !== 'EN_COMPTAGE') {
    throw new BadRequestException(
      'Le calcul des écarts est possible seulement pendant le comptage.',
    );
  }

  if (inventaire.lignes.length === 0) {
    throw new BadRequestException(
      'Impossible de calculer les écarts sans lignes d’inventaire.',
    );
  }

  const lignesNonSaisies = inventaire.lignes.filter(
    (ligne) => ligne.quantiteReelle === null,
  );

  if (lignesNonSaisies.length > 0) {
    throw new BadRequestException(
      'Toutes les quantités réelles doivent être saisies avant de calculer les écarts.',
    );
  }

  for (const ligne of inventaire.lignes) {
    const quantiteTheorique = Number(ligne.quantiteTheorique);
    const quantiteReelle = Number(ligne.quantiteReelle);
    const ecart = quantiteReelle - quantiteTheorique;

    await this.prisma.ligneInventairePrepare.update({
      where: {
        idLigneInventairePrepare: ligne.idLigneInventairePrepare,
      },
      data: {
        ecart,
      },
    });
  }

  return this.findOne(idInventairePrepare);
}
  async validerInventaire(idInventairePrepare: number) {
    const inventaire = await this.findOne(idInventairePrepare);

    if (inventaire.statut !== 'EN_COMPTAGE') {
      throw new BadRequestException(
        'Seul un inventaire en comptage peut être validé.',
      );
    }

    const lignesNonSaisies = inventaire.lignes.filter(
      (ligne) => ligne.quantiteReelle === null,
    );

    if (lignesNonSaisies.length > 0) {
      throw new BadRequestException(
        'Toutes les quantités réelles doivent être saisies avant validation.',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      for (const ligne of inventaire.lignes) {
        const quantiteTheorique = Number(ligne.quantiteTheorique);
        const quantiteReelle = Number(ligne.quantiteReelle);
        const ecart = quantiteReelle - quantiteTheorique;

        await tx.ligneInventairePrepare.update({
          where: {
            idLigneInventairePrepare:
              ligne.idLigneInventairePrepare,
          },
          data: {
            ecart,
          },
        });

        if (ecart === 0) {
          continue;
        }

        const stock = await tx.stock_article_magasin.findFirst({
          where: {
            idMagasin: inventaire.idMagasin,
            idArticle: ligne.idArticle,
          },
        });

        if (!stock && ecart < 0) {
          throw new BadRequestException(
            `Stock introuvable pour l’article ${ligne.article?.reference ?? ligne.idArticle}.`,
          );
        }

        if (stock) {
          await tx.stock_article_magasin.update({
            where: {
              idStock: stock.idStock,
            },
            data: {
              quantitePhysique: {
                increment: ecart,
              },
              quantiteDisponible: {
                increment: ecart,
              },
            },
          });
        } else {
          await tx.stock_article_magasin.create({
            data: {
              idArticle: ligne.idArticle,
              idMagasin: inventaire.idMagasin,
              quantitePhysique: ecart,
              quantiteReservee: 0,
              quantiteDisponible: ecart,
            },
          });
        }

        await tx.mouvement_stock.create({
          data: {
            typeMouvement: ecart > 0 ? 'ENTREE' : 'SORTIE',
            quantite: Math.abs(ecart),
            idArticle: ligne.idArticle,
            idMagasinSource: ecart < 0 ? inventaire.idMagasin : null,
            idMagasinDestination: ecart > 0 ? inventaire.idMagasin : null,
            origineType: 'INVENTAIRE_PREPARE',
            origineId: inventaire.idInventairePrepare,
            commentaire:
              ecart > 0
                ? `Correction inventaire : surplus de ${ecart}`
                : `Correction inventaire : manque de ${Math.abs(ecart)}`,
          },
        });
      }

      await tx.inventairePrepare.update({
        where: {
          idInventairePrepare,
        },
        data: {
          statut: 'VALIDE',
          dateValidation: new Date(),
        },
      });
    });

    return this.findOne(idInventairePrepare);
  }

  async annulerInventaire(idInventairePrepare: number) {
    const inventaire = await this.findOne(idInventairePrepare);

    if (inventaire.statut === 'VALIDE') {
      throw new BadRequestException(
        'Impossible d’annuler un inventaire déjà validé.',
      );
    }

    return this.prisma.inventairePrepare.update({
      where: {
        idInventairePrepare,
      },
      data: {
        statut: 'ANNULE',
      },
      include: this.inventaireInclude,
    });
  }

  async remove(idInventairePrepare: number) {
    const inventaire = await this.findOne(idInventairePrepare);

    if (inventaire.statut !== 'BROUILLON') {
      throw new BadRequestException(
        'Vous pouvez supprimer seulement un inventaire en brouillon.',
      );
    }

    return this.prisma.inventairePrepare.delete({
      where: {
        idInventairePrepare,
      },
    });
  }
}