import { Module } from '@nestjs/common';
import { ModeleController } from './modele.controller';
import { ModeleService } from './modele.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [ModeleController],
  providers: [ModeleService, PrismaService],
})
export class ModeleModule {}