import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '../../../generated/prisma/client';

import {
  EntreeStockDto,
  LigneEntreeStockDto,
  UpdateEntreeStockDto,
  UpdateLigneEntreeStockDto,
} from './dto/entree-stock.dto';

import { SortieStockDto } from './dto/sortie-stock.dto';
import { UpdateSortieStockDto } from './dto/update-sortie-stock.dto';
import { LigneSortieStockCrudDto } from './dto/ligne-sortie-stock-crud.dto';
import { UpdateLigneSortieStockDto } from './dto/update-ligne-sortie-stock.dto';

type Tx = Prisma.TransactionClient;

@Injectable()
export class StockService {
  constructor(private readonly prisma: PrismaService) {}

  /* =========================================================
     STOCK ACTUEL
  ========================================================= */

  async findAllStock() {
    return this.prisma.stock_article_magasin.findMany({
      include: {
        article: {
          include: {
            uniteArticle: true,
            famille: true,
          },
        },
        magasin: true,
      },
      orderBy: {
        idStock: 'desc',
      },
    });
  }

  async findAllMouvements() {
  return this.prisma.mouvement_stock.findMany({
    include: {
      article: true,
      materiel: true,
      magasinSource: true,
      magasinDestination: true,
    },
    orderBy: {
      idMouvement: 'desc',
    },
  });
}

  /* =========================================================
     ENTREES STOCK
  ========================================================= */

  async findEntrees() {
    return this.prisma.entree_stock.findMany({
      include: {
        lignes: {
          include: {
            article: true,
            magasin: true,
            emplacement: true,
            materiels: true,
          },
          orderBy: {
            idLigneEntreeStock: 'asc',
          },
        },
      },
      orderBy: {
        dateReception: 'desc',
      },
    });
  }

  async findEntreeById(idEntreeStock: number) {
    const entree = await this.prisma.entree_stock.findUnique({
      where: { idEntreeStock },
      include: {
        lignes: {
          include: {
            article: true,
            magasin: true,
            emplacement: true,
            materiels: true,
          },
          orderBy: {
            idLigneEntreeStock: 'asc',
          },
        },
      },
    });

    if (!entree) {
      throw new NotFoundException(
        `Le bon d'entrée stock #${idEntreeStock} est introuvable.`,
      );
    }

    return entree;
  }

  async entreeStock(dto: EntreeStockDto) {
    if (!dto.lignes || dto.lignes.length === 0) {
      throw new BadRequestException(
        "Un bon d'entrée doit contenir au moins une ligne.",
      );
    }

    const idEntreeStock = await this.prisma.$transaction(async (tx) => {
      const numero =
        dto.numero?.trim() || (await this.generateNumeroEntree(tx));

      const entree = await tx.entree_stock.create({
        data: {
          numero,
          dateReception: this.parseDateOrNow(dto.dateReception),
          commentaire: dto.commentaire?.trim() || null,
          statut: 'VALIDEE',
        },
      });

      for (const ligneDto of dto.lignes) {
        await this.createEntreeLine(tx, entree.idEntreeStock, ligneDto);
      }

      return entree.idEntreeStock;
    });

    return this.findEntreeById(idEntreeStock);
  }

  async updateEntreeStock(idEntreeStock: number, dto: UpdateEntreeStockDto) {
    const entree = await this.prisma.entree_stock.findUnique({
      where: { idEntreeStock },
    });

    if (!entree) {
      throw new NotFoundException(
        `Le bon d'entrée stock #${idEntreeStock} est introuvable.`,
      );
    }

    const data: Prisma.entree_stockUpdateInput = {};

    if (dto.numero !== undefined) {
      data.numero = dto.numero?.trim();
    }

    if (dto.commentaire !== undefined) {
      data.commentaire = dto.commentaire?.trim() || null;
    }

    if (dto.dateReception !== undefined && dto.dateReception !== '') {
      data.dateReception = this.parseDateOrNow(dto.dateReception);
    }

    await this.prisma.entree_stock.update({
      where: { idEntreeStock },
      data,
    });

    return this.findEntreeById(idEntreeStock);
  }

  async addEntreeStockLigne(idEntreeStock: number, dto: LigneEntreeStockDto) {
    const entree = await this.prisma.entree_stock.findUnique({
      where: { idEntreeStock },
    });

    if (!entree) {
      throw new NotFoundException(
        `Le bon d'entrée stock #${idEntreeStock} est introuvable.`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await this.createEntreeLine(tx, idEntreeStock, dto);
    });

    return this.findEntreeById(idEntreeStock);
  }

  async updateEntreeStockLigne(
  idEntreeStock: number,
  idLigneEntreeStock: number,
  dto: UpdateLigneEntreeStockDto,
) {
  const ligne = await this.prisma.entree_stock_ligne.findUnique({
    where: { idLigneEntreeStock },
    include: {
      entreeStock: true,
      article: true,
      materiels: true,
    },
  });

  if (!ligne || ligne.idEntreeStock !== idEntreeStock) {
    throw new NotFoundException(
      `La ligne d'entrée #${idLigneEntreeStock} est introuvable dans ce bon.`,
    );
  }

  const oldIdArticle = ligne.idArticle;
  const oldIdMagasin = ligne.idMagasin;
  const oldQuantite = Number(ligne.quantite);

  const newIdArticle =
    dto.idArticle !== undefined ? Number(dto.idArticle) : oldIdArticle;

  const newIdMagasin =
    dto.idMagasin !== undefined ? Number(dto.idMagasin) : oldIdMagasin;

  const newIdEmplacement =
    dto.idEmplacement !== undefined
      ? dto.idEmplacement === null
        ? null
        : Number(dto.idEmplacement)
      : ligne.idEmplacement;

  const newQuantite =
    dto.quantite !== undefined
      ? this.toPositiveNumber(dto.quantite, 'La quantité est invalide.')
      : oldQuantite;

  const newPrixUnitaire =
    dto.prixUnitaire !== undefined
      ? this.toNullableNumber(dto.prixUnitaire)
      : undefined;

  await this.prisma.$transaction(async (tx) => {
    const article = await this.assertArticleExists(tx, newIdArticle);

    const magasin = await tx.magasin.findUnique({
      where: { idMagasin: newIdMagasin },
    });

    if (!magasin) {
      throw new NotFoundException(`Magasin #${newIdMagasin} introuvable.`);
    }

    if (magasin.actif === false) {
      throw new BadRequestException(
        'Impossible de modifier une ligne vers un magasin inactif.',
      );
    }

    const materielsDto = dto.materiels ?? [];

    if (article.serialise) {
      if (!Number.isInteger(newQuantite)) {
        throw new BadRequestException(
          'La quantité d’un article sérialisé doit être un nombre entier.',
        );
      }

      if (materielsDto.length > 0 && materielsDto.length !== newQuantite) {
        throw new BadRequestException(
          'Pour un article sérialisé, le nombre de matériels doit correspondre à la quantité.',
        );
      }

      for (let index = 0; index < materielsDto.length; index += 1) {
        const materiel = materielsDto[index];

        if (!materiel.code?.trim()) {
          throw new BadRequestException(
            `Le code du matériel ${index + 1} est obligatoire.`,
          );
        }
      }

      const codes = materielsDto.map((materiel) =>
        materiel.code.trim().toLowerCase(),
      );

      if (new Set(codes).size !== codes.length) {
        throw new BadRequestException(
          'Les codes matériels doivent être uniques dans la même ligne.',
        );
      }
    }

    if (!article.serialise && materielsDto.length > 0) {
      throw new BadRequestException(
        'Impossible de saisir des matériels pour un article non sérialisé.',
      );
    }

    await this.retirerDuStock(tx, {
      idArticle: oldIdArticle,
      idMagasin: oldIdMagasin,
      quantite: oldQuantite,
    });

    await this.ajouterAuStock(tx, {
      idArticle: newIdArticle,
      idMagasin: newIdMagasin,
      quantite: newQuantite,
    });

    await tx.entree_stock_ligne.update({
      where: { idLigneEntreeStock },
      data: {
        idArticle: newIdArticle,
        idMagasin: newIdMagasin,
        idEmplacement: newIdEmplacement,
        quantite: newQuantite,
        prixUnitaire: newPrixUnitaire,
        numeroLot:
          dto.numeroLot !== undefined
            ? dto.numeroLot?.trim() || null
            : undefined,
        datePeremption:
          dto.datePeremption !== undefined
            ? this.parseNullableDate(dto.datePeremption)
            : undefined,
        commentaire:
          dto.commentaire !== undefined
            ? dto.commentaire?.trim() || null
            : undefined,
      },
    });

    await tx.mouvement_stock.create({
      data: {
        typeMouvement: 'AJUSTEMENT_ENTREE',
        dateMouvement: new Date(),
        quantite: newQuantite,
        idArticle: newIdArticle,
        idMateriel: null,
        idMagasinSource: null,
        idMagasinDestination: newIdMagasin,
        origineType: 'ENTREE_STOCK',
        origineId: idEntreeStock,
        commentaire: `Modification de la ligne d'entrée #${idLigneEntreeStock}. Ancienne quantité: ${oldQuantite}, nouvelle quantité: ${newQuantite}.`,
      },
    });

    if (article.serialise && materielsDto.length > 0) {
      const modele = await (tx.modele as any).findFirst({
        where: {
          idArticle: newIdArticle,
        },
      });

      if (!modele) {
        throw new BadRequestException(
          "Impossible de créer les matériels sérialisés : aucun modèle équipement n'est lié à cet article.",
        );
      }

      const etatMateriel = await (tx.etat_materiel as any).findFirst({
        orderBy: {
          idEtat: 'asc',
        },
      });

      const materielsExistants = await (tx.materiel as any).findMany({
        where: {
          idLigneEntreeStock,
        },
        orderBy: {
          idMateriel: 'asc',
        },
      });

      if (materielsExistants.length > materielsDto.length) {
        throw new BadRequestException(
          'Impossible de réduire le nombre de matériels sérialisés depuis cette modification. Supprimez la ligne puis recréez-la si nécessaire.',
        );
      }

      for (let index = 0; index < materielsDto.length; index += 1) {
        const materielDto = materielsDto[index];
        const materielExistant = materielsExistants[index];

        if (materielExistant) {
          await (tx.materiel as any).update({
            where: {
              idMateriel: materielExistant.idMateriel,
            },
            data: {
              code: materielDto.code.trim(),
              libelle:
                materielDto.numeroSerie?.trim() || materielDto.code.trim(),
              numeroSerie: materielDto.numeroSerie?.trim() || null,
              idModele: modele.idModele,
              idEtat: etatMateriel?.idEtat ?? null,
              positionActuelle: 'EN_STOCK',
              gereEnStock: true,
              actif: true,
            },
          });
        } else {
          const materielCree = await (tx.materiel as any).create({
            data: {
              code: materielDto.code.trim(),
              libelle:
                materielDto.numeroSerie?.trim() || materielDto.code.trim(),
              numeroSerie: materielDto.numeroSerie?.trim() || null,

              gereEnStock: true,
              positionActuelle: 'EN_STOCK',

              idModele: modele.idModele,
              idEtat: etatMateriel?.idEtat ?? null,
              idLigneEntreeStock,

              actif: true,
            },
          });

          await (tx.mouvement_stock as any).create({
            data: {
              typeMouvement: 'ENTREE',
              dateMouvement: new Date(),
              quantite: 1,

              idArticle: newIdArticle,
              idMateriel: materielCree.idMateriel,
              idMagasinSource: null,
              idMagasinDestination: newIdMagasin,

              origineType: 'ENTREE_STOCK',
              origineId: idEntreeStock,

              commentaire: `Entrée stock sérialisée - Matériel ${materielCree.code}`,
            },
          });
        }
      }
    }
  });

  return this.findEntreeById(idEntreeStock);
}
  async deleteEntreeStockLigne(
    idEntreeStock: number,
    idLigneEntreeStock: number,
  ) {
    const ligne = await this.prisma.entree_stock_ligne.findUnique({
      where: { idLigneEntreeStock },
      include: {
        entreeStock: true,
      },
    });

    if (!ligne || ligne.idEntreeStock !== idEntreeStock) {
      throw new NotFoundException(
        `La ligne d'entrée #${idLigneEntreeStock} est introuvable dans ce bon.`,
      );
    }

    const quantite = Number(ligne.quantite);

    await this.prisma.$transaction(async (tx) => {
      await this.retirerDuStock(tx, {
        idArticle: ligne.idArticle,
        idMagasin: ligne.idMagasin,
        quantite,
      });

      await tx.mouvement_stock.create({
        data: {
          typeMouvement: 'ANNULATION_ENTREE',
          dateMouvement: new Date(),
          quantite,
          idArticle: ligne.idArticle,
          idMateriel: null,
          idMagasinSource: ligne.idMagasin,
          idMagasinDestination: null,
          origineType: 'ENTREE_STOCK',
          origineId: idEntreeStock,
          commentaire: `Suppression de la ligne d'entrée #${idLigneEntreeStock}.`,
        },
      });

      await tx.entree_stock_ligne.delete({
        where: { idLigneEntreeStock },
      });
    });

    return this.findEntreeById(idEntreeStock);
  }

  /* =========================================================
     SORTIES STOCK
  ========================================================= */

  async findSorties() {
    return this.prisma.sortie_stock.findMany({
      include: {
        lignes: {
          include: {
            article: true,
            magasin: true,
            emplacement: true,
          },
          orderBy: {
            idLigneSortieStock: 'asc',
          },
        },
      },
      orderBy: {
        dateSortie: 'desc',
      },
    });
  }

  async findAllSorties() {
    return this.findSorties();
  }

  async findSortieById(idSortieStock: number) {
    const sortie = await this.prisma.sortie_stock.findUnique({
      where: { idSortieStock },
      include: {
        lignes: {
          include: {
            article: true,
            magasin: true,
            emplacement: true,
          },
          orderBy: {
            idLigneSortieStock: 'asc',
          },
        },
      },
    });

    if (!sortie) {
      throw new NotFoundException(
        `Le bon de sortie stock #${idSortieStock} est introuvable.`,
      );
    }

    return sortie;
  }

  async sortieStock(dto: SortieStockDto) {
    if (!dto.lignes || dto.lignes.length === 0) {
      throw new BadRequestException(
        'Un bon de sortie doit contenir au moins une ligne.',
      );
    }

    const idSortieStock = await this.prisma.$transaction(async (tx) => {
      const numero =
        dto.numero?.trim() || (await this.generateNumeroSortie(tx));

      const sortie = await tx.sortie_stock.create({
        data: {
          numero,
          dateSortie: this.parseDateOrNow(dto.dateSortie),
          commentaire: dto.commentaire?.trim() || null,
          statut: 'VALIDEE',
        },
      });

      for (const ligneDto of dto.lignes) {
        await this.createSortieLine(tx, sortie.idSortieStock, ligneDto);
      }

      return sortie.idSortieStock;
    });

    return this.findSortieById(idSortieStock);
  }

  async updateSortieStock(idSortieStock: number, dto: UpdateSortieStockDto) {
    const sortie = await this.prisma.sortie_stock.findUnique({
      where: { idSortieStock },
    });

    if (!sortie) {
      throw new NotFoundException(
        `Le bon de sortie stock #${idSortieStock} est introuvable.`,
      );
    }

    this.assertBonEditable(sortie.statut);

    const data: Prisma.sortie_stockUpdateInput = {};

    if (dto.numero !== undefined) {
      data.numero = dto.numero?.trim();
    }

    if (dto.commentaire !== undefined) {
      data.commentaire = dto.commentaire?.trim() || null;
    }

    if (dto.dateSortie !== undefined && dto.dateSortie !== '') {
      data.dateSortie = this.parseDateOrNow(dto.dateSortie);
    }

    await this.prisma.sortie_stock.update({
      where: { idSortieStock },
      data,
    });

    return this.findSortieById(idSortieStock);
  }

  async addSortieStockLigne(
    idSortieStock: number,
    dto: LigneSortieStockCrudDto,
  ) {
    const sortie = await this.prisma.sortie_stock.findUnique({
      where: { idSortieStock },
    });

    if (!sortie) {
      throw new NotFoundException(
        `Le bon de sortie stock #${idSortieStock} est introuvable.`,
      );
    }

    this.assertBonEditable(sortie.statut);

    await this.prisma.$transaction(async (tx) => {
      await this.createSortieLine(tx, idSortieStock, dto);
    });

    return this.findSortieById(idSortieStock);
  }

  async updateLigneSortieStock(
  idSortieStock: number,
  idLigneSortieStock: number,
  dto: UpdateLigneSortieStockDto,
) {
  const ligne = await this.prisma.sortie_stock_ligne.findUnique({
    where: { idLigneSortieStock },
    include: {
      sortieStock: true,
    },
  });

  if (!ligne || ligne.idSortieStock !== idSortieStock) {
    throw new NotFoundException(
      `La ligne de sortie #${idLigneSortieStock} est introuvable dans ce bon.`,
    );
  }

  this.assertBonEditable(ligne.sortieStock.statut);

  const oldIdArticle = ligne.idArticle;
  const oldIdMagasin = ligne.idMagasin;
  const oldQuantite = Number(ligne.quantite);

  const newIdArticle =
    dto.idArticle !== undefined ? Number(dto.idArticle) : oldIdArticle;

  const newIdMagasin =
    dto.idMagasin !== undefined ? Number(dto.idMagasin) : oldIdMagasin;

  const newIdEmplacement =
    dto.idEmplacement !== undefined
      ? dto.idEmplacement === null
        ? null
        : Number(dto.idEmplacement)
      : ligne.idEmplacement;

  const newQuantite =
    dto.quantite !== undefined
      ? this.toPositiveNumber(dto.quantite, 'La quantité sortie est invalide.')
      : oldQuantite;

  const newPrixUnitaire =
    dto.prixUnitaire !== undefined
      ? this.toNullableNumber(dto.prixUnitaire)
      : undefined;

  const articleChanged = oldIdArticle !== newIdArticle;
  const magasinChanged = oldIdMagasin !== newIdMagasin;
  const ecartQuantite = newQuantite - oldQuantite;

  await this.prisma.$transaction(async (tx) => {
    await this.assertArticleNonSerialise(tx, newIdArticle);

    /*
      CAS 1 :
      L'article ou le magasin change.
      On remet l'ancienne sortie dans l'ancien stock,
      puis on applique la nouvelle sortie.
    */
    if (articleChanged || magasinChanged) {
      await this.remettreDansStock(tx, {
        idArticle: oldIdArticle,
        idMagasin: oldIdMagasin,
        quantite: oldQuantite,
      });

      await this.retirerDuStock(tx, {
        idArticle: newIdArticle,
        idMagasin: newIdMagasin,
        quantite: newQuantite,
      });

      await tx.sortie_stock_ligne.update({
        where: { idLigneSortieStock },
        data: {
          idArticle: newIdArticle,
          idMagasin: newIdMagasin,
          idEmplacement: newIdEmplacement,
          quantite: newQuantite,
          prixUnitaire: newPrixUnitaire,
          commentaire:
            dto.commentaire !== undefined
              ? dto.commentaire?.trim() || null
              : undefined,
        },
      });

      // Nouvelle ligne mouvement : correction retour ancienne sortie
      await tx.mouvement_stock.create({
        data: {
          typeMouvement: 'CORRECTION',
          dateMouvement: new Date(),
          quantite: oldQuantite,
          idArticle: oldIdArticle,
          idMateriel: null,
          idMagasinSource: null,
          idMagasinDestination: oldIdMagasin,
          origineType: 'SORTIE_STOCK',
          origineId: idSortieStock,
          commentaire: `Correction ligne sortie #${idLigneSortieStock} : annulation de l'ancienne sortie. Ancien article #${oldIdArticle}, ancien magasin #${oldIdMagasin}, quantité ${oldQuantite}.`,
        },
      });

      // Nouvelle ligne mouvement : correction nouvelle sortie
      await tx.mouvement_stock.create({
        data: {
          typeMouvement: 'CORRECTION',
          dateMouvement: new Date(),
          quantite: newQuantite,
          idArticle: newIdArticle,
          idMateriel: null,
          idMagasinSource: newIdMagasin,
          idMagasinDestination: null,
          origineType: 'SORTIE_STOCK',
          origineId: idSortieStock,
          commentaire: `Correction ligne sortie #${idLigneSortieStock} : application de la nouvelle sortie. Nouvel article #${newIdArticle}, nouveau magasin #${newIdMagasin}, quantité ${newQuantite}.`,
        },
      });

      return;
    }

    /*
      CAS 2 :
      Même article et même magasin.
      On corrige seulement l'écart de quantité.
    */
    if (ecartQuantite > 0) {
      // La sortie augmente : on retire seulement l'écart du stock.
      await this.retirerDuStock(tx, {
        idArticle: newIdArticle,
        idMagasin: newIdMagasin,
        quantite: ecartQuantite,
      });
    }

    if (ecartQuantite < 0) {
      // La sortie diminue : on remet seulement l'écart dans le stock.
      await this.remettreDansStock(tx, {
        idArticle: newIdArticle,
        idMagasin: newIdMagasin,
        quantite: Math.abs(ecartQuantite),
      });
    }

    await tx.sortie_stock_ligne.update({
      where: { idLigneSortieStock },
      data: {
        idArticle: newIdArticle,
        idMagasin: newIdMagasin,
        idEmplacement: newIdEmplacement,
        quantite: newQuantite,
        prixUnitaire: newPrixUnitaire,
        commentaire:
          dto.commentaire !== undefined
            ? dto.commentaire?.trim() || null
            : undefined,
      },
    });

    /*
      IMPORTANT :
      On crée TOUJOURS une nouvelle ligne CORRECTION.
      On ne modifie jamais l'ancien mouvement SORTIE.
    */
    await tx.mouvement_stock.create({
      data: {
        typeMouvement: 'CORRECTION',
        dateMouvement: new Date(),
        quantite: newQuantite,
        idArticle: newIdArticle,
        idMateriel: null,
        idMagasinSource: ecartQuantite > 0 ? newIdMagasin : null,
        idMagasinDestination: ecartQuantite < 0 ? newIdMagasin : null,
        origineType: 'SORTIE_STOCK',
        origineId: idSortieStock,
        commentaire: `Correction de la ligne sortie #${idLigneSortieStock}. Ancienne quantité: ${oldQuantite}, nouvelle quantité: ${newQuantite}.`,
      },
    });
  });

  return this.findSortieById(idSortieStock);
}

  async deleteSortieStockLigne(
    idSortieStock: number,
    idLigneSortieStock: number,
  ) {
    const ligne = await this.prisma.sortie_stock_ligne.findUnique({
      where: { idLigneSortieStock },
      include: {
        sortieStock: true,
      },
    });

    if (!ligne || ligne.idSortieStock !== idSortieStock) {
      throw new NotFoundException(
        `La ligne de sortie #${idLigneSortieStock} est introuvable dans ce bon.`,
      );
    }

    this.assertBonEditable(ligne.sortieStock.statut);

    const quantite = Number(ligne.quantite);

    await this.prisma.$transaction(async (tx) => {
      await this.remettreDansStock(tx, {
        idArticle: ligne.idArticle,
        idMagasin: ligne.idMagasin,
        quantite,
      });

      await tx.mouvement_stock.create({
        data: {
          typeMouvement: 'ANNULATION_SORTIE',
          dateMouvement: new Date(),
          quantite,
          idArticle: ligne.idArticle,
          idMateriel: null,
          idMagasinSource: null,
          idMagasinDestination: ligne.idMagasin,
          origineType: 'SORTIE_STOCK',
          origineId: idSortieStock,
          commentaire: `Suppression de la ligne sortie #${idLigneSortieStock}.`,
        },
      });

      await tx.sortie_stock_ligne.delete({
        where: { idLigneSortieStock },
      });
    });

    return this.findSortieById(idSortieStock);
  }

  /* =========================================================
     HELPERS ENTREES / SORTIES
  ========================================================= */

 private async createEntreeLine(
  tx: Tx,
  idEntreeStock: number,
  dto: LigneEntreeStockDto,
) {
  const idArticle = Number(dto.idArticle);
  const idMagasin = Number(dto.idMagasin);

  const quantite = this.toPositiveNumber(
    dto.quantite,
    'La quantité entrée est invalide.',
  );

  const article = await this.assertArticleExists(tx, idArticle);

  const magasin = await tx.magasin.findUnique({
    where: { idMagasin },
  });

  if (!magasin) {
    throw new NotFoundException(`Magasin #${idMagasin} introuvable.`);
  }

  if (magasin.actif === false) {
    throw new BadRequestException(
      'Impossible de faire une entrée dans un magasin inactif.',
    );
  }

  const materiels = dto.materiels ?? [];

  if (article.serialise) {
    if (!Number.isInteger(quantite)) {
      throw new BadRequestException(
        'La quantité d’un article sérialisé doit être un nombre entier.',
      );
    }

    if (materiels.length !== quantite) {
      throw new BadRequestException(
        'Pour un article sérialisé, le nombre de matériels doit correspondre à la quantité.',
      );
    }

    for (let index = 0; index < materiels.length; index += 1) {
      const materiel = materiels[index];

      if (!materiel.code?.trim()) {
        throw new BadRequestException(
          `Le code du matériel ${index + 1} est obligatoire.`,
        );
      }
    }

    const codes = materiels.map((materiel) =>
      materiel.code.trim().toLowerCase(),
    );

    if (new Set(codes).size !== codes.length) {
      throw new BadRequestException(
        'Les codes matériels doivent être uniques dans la même ligne.',
      );
    }
  }

  if (!article.serialise && materiels.length > 0) {
    throw new BadRequestException(
      'Impossible de saisir des matériels pour un article non sérialisé.',
    );
  }

  const ligne = await tx.entree_stock_ligne.create({
    data: {
      idEntreeStock,
      idArticle,
      idMagasin,
      idEmplacement: dto.idEmplacement ?? null,
      quantite,
      prixUnitaire: this.toNullableNumber(dto.prixUnitaire),
      numeroLot: dto.numeroLot?.trim() || null,
      datePeremption: this.parseNullableDate(dto.datePeremption),
      commentaire: dto.commentaire?.trim() || null,
    },
  });

  await this.ajouterAuStock(tx, {
    idArticle,
    idMagasin,
    quantite,
  });

  await tx.mouvement_stock.create({
    data: {
      typeMouvement: 'ENTREE',
      dateMouvement: new Date(),
      quantite,
      idArticle,
      idMateriel: null,
      idMagasinSource: null,
      idMagasinDestination: idMagasin,
      origineType: 'ENTREE_STOCK',
      origineId: idEntreeStock,
      commentaire: `Entrée stock - ligne #${ligne.idLigneEntreeStock}.`,
    },
  });

  if (article.serialise) {
    const modele = await (tx.modele as any).findFirst({
      where: {
        idArticle,
      },
    });

    if (!modele) {
      throw new BadRequestException(
        "Impossible de créer les matériels sérialisés : aucun modèle équipement n'est lié à cet article.",
      );
    }

    const etatMateriel = await (tx.etat_materiel as any).findFirst({
      orderBy: {
        idEtat: 'asc',
      },
    });

    for (const materiel of materiels) {
      const materielCree = await (tx.materiel as any).create({
        data: {
          code: materiel.code.trim(),
          libelle: materiel.numeroSerie?.trim() || materiel.code.trim(),
          numeroSerie: materiel.numeroSerie?.trim() || null,

          gereEnStock: true,
          positionActuelle: 'EN_STOCK',

          idModele: modele.idModele,
          idEtat: etatMateriel?.idEtat ?? null,
          idLigneEntreeStock: ligne.idLigneEntreeStock,

          actif: true,
        },
      });

      await (tx.mouvement_stock as any).create({
        data: {
          typeMouvement: 'ENTREE',
          dateMouvement: new Date(),
          quantite: 1,

          idArticle,
          idMateriel: materielCree.idMateriel,
          idMagasinSource: null,
          idMagasinDestination: idMagasin,

          origineType: 'ENTREE_STOCK',
          origineId: idEntreeStock,

          commentaire: `Entrée stock sérialisée - Matériel ${materielCree.code}`,
        },
      });
    }
  }

  return ligne;
}
  private async createSortieLine(
    tx: Tx,
    idSortieStock: number,
    dto: LigneSortieStockCrudDto,
  ) {
    const idArticle = Number(dto.idArticle);
    const idMagasin = Number(dto.idMagasin);

    const quantite = this.toPositiveNumber(
      dto.quantite,
      'La quantité sortie est invalide.',
    );

    const prixUnitaire = this.toNullableNumber(dto.prixUnitaire);

    await this.assertArticleNonSerialise(tx, idArticle);

    const sortie = await tx.sortie_stock.findUnique({
      where: { idSortieStock },
      select: {
        dateSortie: true,
      },
    });

    if (!sortie) {
      throw new NotFoundException(
        `Le bon de sortie stock #${idSortieStock} est introuvable.`,
      );
    }

    await this.retirerDuStock(tx, {
      idArticle,
      idMagasin,
      quantite,
    });

    const ligne = await tx.sortie_stock_ligne.create({
      data: {
        idSortieStock,
        idArticle,
        idMagasin,
        idEmplacement: dto.idEmplacement ?? null,
        idMateriel: null,
        quantite,
        prixUnitaire,
        commentaire: dto.commentaire?.trim() || null,
      },
    });

    await tx.mouvement_stock.create({
      data: {
        typeMouvement: 'SORTIE',
        dateMouvement: sortie.dateSortie,
        quantite,
        idArticle,
        idMateriel: null,
        idMagasinSource: idMagasin,
        idMagasinDestination: null,
        origineType: 'SORTIE_STOCK',
        origineId: idSortieStock,
        commentaire: `Sortie stock - ligne #${ligne.idLigneSortieStock}.`,
      },
    });

    return ligne;
  }

  private async ajouterAuStock(
    tx: Tx,
    data: {
      idArticle: number;
      idMagasin: number;
      quantite: number;
    },
  ) {
    await tx.stock_article_magasin.upsert({
      where: {
        idArticle_idMagasin: {
          idArticle: data.idArticle,
          idMagasin: data.idMagasin,
        },
      },
      create: {
        idArticle: data.idArticle,
        idMagasin: data.idMagasin,
        quantitePhysique: data.quantite,
        quantiteReservee: 0,
        quantiteDisponible: data.quantite,
      },
      update: {
        quantitePhysique: {
          increment: data.quantite,
        },
        quantiteDisponible: {
          increment: data.quantite,
        },
      },
    });
  }

  private async remettreDansStock(
    tx: Tx,
    data: {
      idArticle: number;
      idMagasin: number;
      quantite: number;
    },
  ) {
    await this.ajouterAuStock(tx, data);
  }

  private async retirerDuStock(
    tx: Tx,
    data: {
      idArticle: number;
      idMagasin: number;
      quantite: number;
    },
  ) {
    const stock = await tx.stock_article_magasin.findUnique({
      where: {
        idArticle_idMagasin: {
          idArticle: data.idArticle,
          idMagasin: data.idMagasin,
        },
      },
    });

    if (!stock) {
      throw new BadRequestException(
        `Aucun stock trouvé pour l'article #${data.idArticle} dans le magasin #${data.idMagasin}.`,
      );
    }

    const disponible = Number(stock.quantiteDisponible);

    if (disponible < data.quantite) {
      throw new BadRequestException(
        `Stock disponible insuffisant. Disponible : ${disponible}. Demandé : ${data.quantite}.`,
      );
    }

    await tx.stock_article_magasin.update({
      where: {
        idArticle_idMagasin: {
          idArticle: data.idArticle,
          idMagasin: data.idMagasin,
        },
      },
      data: {
        quantitePhysique: {
          decrement: data.quantite,
        },
        quantiteDisponible: {
          decrement: data.quantite,
        },
      },
    });
  }

  private async assertArticleExists(tx: Tx, idArticle: number) {
    const article = await tx.article.findUnique({
      where: { idArticle },
    });

    if (!article) {
      throw new NotFoundException(`Article #${idArticle} introuvable.`);
    }

    return article;
  }

  private async assertArticleNonSerialise(tx: Tx, idArticle: number) {
    const article = await this.assertArticleExists(tx, idArticle);

    if (article.serialise) {
      throw new BadRequestException(
        'Impossible de faire une sortie stock simple pour un article sérialisé.',
      );
    }

    return article;
  }

  private assertBonEditable(statut?: string | null) {
    if (statut === 'ANNULEE' || statut === 'ANNULE') {
      throw new BadRequestException(
        'Ce bon est annulé, il ne peut plus être modifié.',
      );
    }
  }

  private toPositiveNumber(value: unknown, message: string) {
    const numberValue = Number(value);

    if (!Number.isFinite(numberValue) || numberValue <= 0) {
      throw new BadRequestException(message);
    }

    return numberValue;
  }

  private toNullableNumber(value: unknown): number | null {
    if (value === undefined || value === null || value === '') {
      return null;
    }

    const numberValue = Number(value);

    if (!Number.isFinite(numberValue)) {
      throw new BadRequestException('Valeur numérique invalide.');
    }

    return numberValue;
  }

  private parseDateOrNow(value?: string | Date | null) {
    if (!value) {
      return new Date();
    }

    if (value instanceof Date) {
      if (Number.isNaN(value.getTime())) {
        throw new BadRequestException('Date invalide.');
      }

      return value;
    }

    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return new Date();
    }

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmedValue)) {
      const [day, month, year] = trimmedValue.split('/').map(Number);
      return new Date(year, month - 1, day);
    }

    const date = new Date(trimmedValue);

    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('Date invalide.');
    }

    return date;
  }

  private parseNullableDate(value?: string | Date | null) {
    if (value === undefined || value === null || value === '') {
      return null;
    }

    return this.parseDateOrNow(value);
  }

  private async generateNumeroEntree(tx: Tx) {
    const year = new Date().getFullYear();

    const last = await tx.entree_stock.findFirst({
      where: {
        numero: {
          startsWith: `BE-${year}-`,
        },
      },
      orderBy: {
        idEntreeStock: 'desc',
      },
    });

    const lastNumber = last?.numero ? Number(last.numero.split('-').pop()) : 0;

    const nextNumber = Number.isFinite(lastNumber) ? lastNumber + 1 : 1;

    return `BE-${year}-${String(nextNumber).padStart(4, '0')}`;
  }

  private async generateNumeroSortie(tx: Tx) {
    const year = new Date().getFullYear();

    const last = await tx.sortie_stock.findFirst({
      where: {
        numero: {
          startsWith: `BS-${year}-`,
        },
      },
      orderBy: {
        idSortieStock: 'desc',
      },
    });

    const lastNumber = last?.numero ? Number(last.numero.split('-').pop()) : 0;

    const nextNumber = Number.isFinite(lastNumber) ? lastNumber + 1 : 1;

    return `BS-${year}-${String(nextNumber).padStart(4, '0')}`;
  }
}