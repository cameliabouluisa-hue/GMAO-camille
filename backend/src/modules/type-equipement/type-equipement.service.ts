import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TypeEquipementService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.type_equipement.findMany({
      where: {
        actif: true,
      },
      orderBy: {
        libelle: 'asc',
      },
    });
  }
}