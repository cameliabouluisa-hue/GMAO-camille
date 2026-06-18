import { Module } from '@nestjs/common';
import { UniteArticleController } from './unite-article.controller';
import { UniteArticleService } from './unite-article.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [UniteArticleController],
  providers: [UniteArticleService, PrismaService],
  exports: [UniteArticleService],
})
export class UniteArticleModule {}