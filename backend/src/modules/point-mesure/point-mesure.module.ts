import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';
import { PointMesureController } from './point-mesure.controller';
import { PointMesureService } from './point-mesure.service';

@Module({
  imports: [PrismaModule],
  controllers: [PointMesureController],
  providers: [PointMesureService],
  exports: [PointMesureService],
})
export class PointMesureModule {}