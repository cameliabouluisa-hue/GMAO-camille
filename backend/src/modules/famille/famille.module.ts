import { Module } from '@nestjs/common';
import { FamilleService } from './famille.service';
import { FamilleController } from './famille.controller';

@Module({
  providers: [FamilleService],
  controllers: [FamilleController]
})
export class FamilleModule {}
