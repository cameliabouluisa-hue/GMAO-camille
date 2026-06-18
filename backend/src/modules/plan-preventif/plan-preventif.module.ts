import { Module } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { PlanPreventifController } from './plan-preventif.controller';
import { PlanPreventifService } from './plan-preventif.service';

@Module({
  controllers: [PlanPreventifController],
  providers: [PlanPreventifService, PrismaService],
  exports: [PlanPreventifService],
})
export class PlanPreventifModule {}