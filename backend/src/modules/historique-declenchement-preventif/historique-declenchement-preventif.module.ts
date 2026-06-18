import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { HistoriqueDeclenchementPreventifController } from './historique-declenchement-preventif.controller';
import { HistoriqueDeclenchementPreventifService } from './historique-declenchement-preventif.service';

@Module({
  imports: [PrismaModule],
  controllers: [HistoriqueDeclenchementPreventifController],
  providers: [HistoriqueDeclenchementPreventifService],
})
export class HistoriqueDeclenchementPreventifModule {}