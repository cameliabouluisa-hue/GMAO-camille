import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUniteArticleDto } from './dto/create-unite-article.dto';
import { UpdateUniteArticleDto } from './dto/update-unite-article.dto';

@Injectable()
export class UniteArticleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateUniteArticleDto) {
    const existing = await this.prisma.unite_article.findUnique({
      where: { code: createDto.code },
    });

    if (existing) {
      throw new BadRequestException('Une unité avec ce code existe déjà.');
    }

    return this.prisma.unite_article.create({
      data: {
        code: createDto.code.trim(),
        libelle: createDto.libelle.trim(),
      },
    });
  }

  async findAll() {
    return this.prisma.unite_article.findMany({
      orderBy: { code: 'asc' },
    });
  }
  
  async findOne(id: number) {
    const unite = await this.prisma.unite_article.findUnique({
      where: { idUniteArticle: id },
    });

    if (!unite) {
      throw new NotFoundException('Unité article introuvable.');
    }

    return unite;
  }

  async update(id: number, updateDto: UpdateUniteArticleDto) {
    await this.findOne(id);

    if (updateDto.code) {
      const existing = await this.prisma.unite_article.findFirst({
        where: {
          code: updateDto.code,
          NOT: { idUniteArticle: id },
        },
      });

      if (existing) {
        throw new BadRequestException('Une unité avec ce code existe déjà.');
      }
    }

    return this.prisma.unite_article.update({
      where: { idUniteArticle: id },
      data: {
        ...(updateDto.code !== undefined && { code: updateDto.code.trim() }),
        ...(updateDto.libelle !== undefined && {
          libelle: updateDto.libelle.trim(),
        }),
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    const articlesCount = await this.prisma.article.count({
      where: { idUniteArticle: id },
    });

    if (articlesCount > 0) {
      throw new BadRequestException(
        "Impossible de supprimer cette unité car elle est utilisée par des articles.",
      );
    }

    return this.prisma.unite_article.delete({
      where: { idUniteArticle: id },
    });
  }
}