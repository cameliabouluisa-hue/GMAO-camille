import { Module } from '@nestjs/common';
import { TypeEquipementController } from './type-equipement.controller';
import { TypeEquipementService } from './type-equipement.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [TypeEquipementController],
  providers: [TypeEquipementService, PrismaService],
})
export class TypeEquipementModule {}