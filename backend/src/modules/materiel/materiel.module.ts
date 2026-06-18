import { Module } from '@nestjs/common';
import { MaterielController } from './materiel.controller';
import { MaterielService } from './materiel.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [MaterielController],
  providers: [MaterielService, PrismaService],
  exports: [MaterielService],
})
export class MaterielModule {}