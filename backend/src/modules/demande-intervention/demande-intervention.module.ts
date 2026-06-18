import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { DemandeInterventionController } from './demande-intervention.controller';
import { DemandeInterventionService } from './demande-intervention.service';

@Module({
  imports: [PrismaModule],
  controllers: [DemandeInterventionController],
  providers: [DemandeInterventionService],
  exports: [DemandeInterventionService],
})
export class DemandeInterventionModule {}