import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FabricantService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.fabricant.findMany({
      where: {
        actif: true,
      },
      orderBy: {
        nom: 'asc',
      },
    });
  }
}