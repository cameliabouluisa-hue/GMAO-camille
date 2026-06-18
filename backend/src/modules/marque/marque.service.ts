import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MarqueService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.marque.findMany({
      where: {
        actif: true,
      },
      include: {
        fabricant: true,
      },
      orderBy: {
        libelle: 'asc',
      },
    });
  }
}