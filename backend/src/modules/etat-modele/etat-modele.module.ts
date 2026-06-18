import { Module } from '@nestjs/common';
import { EtatModeleController } from './etat-modele.controller';
import { EtatModeleService } from './etat-modele.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [EtatModeleController],
  providers: [EtatModeleService, PrismaService],
})
export class EtatModeleModule {}