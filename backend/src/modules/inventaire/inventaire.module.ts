import { Module } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { InventaireController } from './inventaire.controller';
import { InventaireService } from './inventaire.service';

@Module({
  controllers: [InventaireController],
  providers: [InventaireService, PrismaService],
})
export class InventaireModule {}