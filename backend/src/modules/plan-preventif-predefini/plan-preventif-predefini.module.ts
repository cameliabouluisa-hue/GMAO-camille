import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PlanPreventifPredefiniController } from './plan-preventif-predefini.controller';
import { PlanPreventifPredefiniService } from './plan-preventif-predefini.service';

@Module({
  imports: [PrismaModule],
  controllers: [PlanPreventifPredefiniController],
  providers: [PlanPreventifPredefiniService],
})
export class PlanPreventifPredefiniModule {}