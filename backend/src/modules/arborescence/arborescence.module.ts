import { Module } from '@nestjs/common';
import { ArborescenceController } from './arborescence.controller';
import { ArborescenceService } from './arborescence.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [ArborescenceController],
  providers: [ArborescenceService, PrismaService],
})
export class ArborescenceModule {}