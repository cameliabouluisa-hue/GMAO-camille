import { Module } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { PlanPreventifModule } from '../plan-preventif/plan-preventif.module';

import { ReleveMesureController } from './releve-mesure.controller';
import { ReleveMesureService } from './releve-mesure.service';

@Module({
  imports: [PlanPreventifModule],
  controllers: [ReleveMesureController],
  providers: [ReleveMesureService, PrismaService],
  exports: [ReleveMesureService],
})
export class ReleveMesureModule {}