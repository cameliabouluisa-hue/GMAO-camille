import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEtatModeleDto } from './dto/create-etat-modele.dto';
import { UpdateEtatModeleDto } from './dto/update-etat-modele.dto';

@Injectable()
export class EtatModeleService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.etat_modele.findMany({
      orderBy: {
        idEtat: 'asc',
      },
      include: {
        _count: {
          select: {
            modele: true,
          },
        },
      },
    });
  }

  async findOne(idEtat: number) {
    const etat = await this.prisma.etat_modele.findUnique({
      where: { idEtat },
      include: {
        modele: true,
        _count: {
          select: {
            modele: true,
          },
        },
      },
    });

    if (!etat) {
      throw new NotFoundException('État modèle introuvable.');
    }

    return etat;
  }

  async create(createEtatModeleDto: CreateEtatModeleDto) {
    const existing = await this.prisma.etat_modele.findUnique({
      where: { idEtat: createEtatModeleDto.idEtat },
    });

    if (existing) {
      throw new BadRequestException('Un état modèle avec cet ID existe déjà.');
    }

    return this.prisma.etat_modele.create({
      data: {
        idEtat: createEtatModeleDto.idEtat,
        libelle: createEtatModeleDto.libelle,
      },
    });
  }

  async update(idEtat: number, updateEtatModeleDto: UpdateEtatModeleDto) {
    const existing = await this.prisma.etat_modele.findUnique({
      where: { idEtat },
    });

    if (!existing) {
      throw new NotFoundException('État modèle introuvable.');
    }

    return this.prisma.etat_modele.update({
      where: { idEtat },
      data: updateEtatModeleDto,
    });
  }

  async remove(idEtat: number) {
    const existing = await this.prisma.etat_modele.findUnique({
      where: { idEtat },
      include: {
        _count: {
          select: {
            modele: true,
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('État modèle introuvable.');
    }

    if (existing._count.modele > 0) {
      throw new BadRequestException(
        'Impossible de supprimer cet état modèle car il est utilisé par un ou plusieurs modèles.',
      );
    }

    return this.prisma.etat_modele.delete({
      where: { idEtat },
    });
  }
}