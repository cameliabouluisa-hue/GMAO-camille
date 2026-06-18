import { Module } from '@nestjs/common';

import { DemandesTransfertController } from './demandes-transfert.controller';
import { DemandesTransfertService } from './demandes-transfert.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DemandesTransfertController],
  providers: [DemandesTransfertService],
})
export class DemandesTransfertModule {}