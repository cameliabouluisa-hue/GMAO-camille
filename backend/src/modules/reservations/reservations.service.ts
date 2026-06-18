import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  private includeReservation() {
    return {
      article: {
        include: {
          famille: true,
          uniteArticle: true,
        },
      },
      magasin: true,
    };
  }

  private includeStock() {
    return {
      article: {
        include: {
          famille: true,
          uniteArticle: true,
        },
      },
      magasin: true,
    };
  }

  async findAll() {
    return this.prisma.reservation_stock.findMany({
      include: this.includeReservation(),
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const reservation = await this.prisma.reservation_stock.findUnique({
      where: {
        idReservationStock: id,
      },
      include: this.includeReservation(),
    });

    if (!reservation) {
      throw new NotFoundException('Réservation introuvable.');
    }

    return reservation;
  }

  async getStockDisponible() {
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
      include: this.includeStock(),
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

  async create(dto: CreateReservationDto) {
    const quantite = Number(dto.quantite);

    if (quantite <= 0) {
      throw new BadRequestException('La quantité doit être supérieure à zéro.');
    }

    const stock = await this.prisma.stock_article_magasin.findUnique({
      where: {
        idArticle_idMagasin: {
          idArticle: dto.idArticle,
          idMagasin: dto.idMagasin,
        },
      },
      include: this.includeStock(),
    });

    if (!stock) {
      throw new NotFoundException(
        'Aucun stock trouvé pour cet article dans ce magasin.',
      );
    }

    const disponible = Number(stock.quantiteDisponible);

    if (disponible < quantite) {
      throw new BadRequestException(
        `Stock disponible insuffisant. Disponible : ${disponible}.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const count = await tx.reservation_stock.count();

      const numero = `RS-${new Date().getFullYear()}-${String(
        count + 1,
      ).padStart(4, '0')}`;

      const reservation = await tx.reservation_stock.create({
        data: {
          numero,
          idArticle: dto.idArticle,
          idMagasin: dto.idMagasin,
          quantite,
          statut: 'VALIDEE',
          demandeur: dto.demandeur?.trim() || null,
          origineType: dto.origineType?.trim() || null,
          origineId: dto.origineId || null,
          commentaire: dto.commentaire?.trim() || null,
        },
        include: this.includeReservation(),
      });

      await tx.stock_article_magasin.update({
        where: {
          idArticle_idMagasin: {
            idArticle: dto.idArticle,
            idMagasin: dto.idMagasin,
          },
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

      return reservation;
    });
  }

  async annuler(id: number) {
    const reservation = await this.prisma.reservation_stock.findUnique({
      where: {
        idReservationStock: id,
      },
    });

    if (!reservation) {
      throw new NotFoundException('Réservation introuvable.');
    }

    if (reservation.statut === 'ANNULEE') {
      throw new BadRequestException('Cette réservation est déjà annulée.');
    }

    const quantite = Number(reservation.quantite);

    return this.prisma.$transaction(async (tx) => {
      await tx.stock_article_magasin.update({
        where: {
          idArticle_idMagasin: {
            idArticle: reservation.idArticle,
            idMagasin: reservation.idMagasin,
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

      return tx.reservation_stock.update({
        where: {
          idReservationStock: id,
        },
        data: {
          statut: 'ANNULEE',
          dateAnnulation: new Date(),
        },
        include: this.includeReservation(),
      });
    });
  }

  async remove(id: number) {
    const reservation = await this.prisma.reservation_stock.findUnique({
      where: {
        idReservationStock: id,
      },
    });

    if (!reservation) {
      throw new NotFoundException('Réservation introuvable.');
    }

    if (reservation.statut === 'VALIDEE') {
      throw new BadRequestException(
        'Impossible de supprimer une réservation validée. Annulez-la d’abord.',
      );
    }

    return this.prisma.reservation_stock.delete({
      where: {
        idReservationStock: id,
      },
    });
  }
}