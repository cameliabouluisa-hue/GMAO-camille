import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';
import { ReapprovisionnementController } from './reapprovisionnement.controller';
import { ReapprovisionnementService } from './reapprovisionnement.service';

@Module({
  imports: [PrismaModule],
  controllers: [ReapprovisionnementController],
  providers: [ReapprovisionnementService],
})
export class ReapprovisionnementModule {}