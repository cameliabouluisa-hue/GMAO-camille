import { Module } from '@nestjs/common';
import { FabricantController } from './fabricant.controller';
import { FabricantService } from './fabricant.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [FabricantController],
  providers: [FabricantService, PrismaService],
})
export class FabricantModule {}