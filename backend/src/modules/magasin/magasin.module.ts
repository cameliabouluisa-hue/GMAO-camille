import { Module } from '@nestjs/common';
import { MagasinController } from './magasin.controller';
import { MagasinService } from './magasin.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [MagasinController],
  providers: [MagasinService, PrismaService],
  exports: [MagasinService],
})
export class MagasinModule {}