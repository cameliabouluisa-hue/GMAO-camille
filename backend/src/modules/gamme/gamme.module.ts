import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { GammeController } from './gamme.controller';
import { GammeService } from './gamme.service';

@Module({
  imports: [PrismaModule],
  controllers: [GammeController],
  providers: [GammeService],
})
export class GammeModule {}