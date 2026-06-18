import { Module } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { InventairesPreparesController } from './inventaires-prepares.controller';
import { InventairesPreparesService } from './inventaires-prepares.service';

@Module({
  controllers: [InventairesPreparesController],
  providers: [InventairesPreparesService, PrismaService],
  exports: [InventairesPreparesService],
})
export class InventairesPreparesModule {}