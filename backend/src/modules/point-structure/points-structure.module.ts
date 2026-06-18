import { Module } from '@nestjs/common';
import { PointsStructureController } from './points-structure.controller';
import { PointsStructureService } from './points-structure.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PointsStructureController],
  providers: [PointsStructureService],
  exports: [PointsStructureService],
})
export class PointsStructureModule {}