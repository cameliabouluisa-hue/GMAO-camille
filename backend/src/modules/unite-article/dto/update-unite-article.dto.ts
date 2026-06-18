import { PartialType } from '@nestjs/mapped-types';
import { CreateUniteArticleDto } from './create-unite-article.dto';

export class UpdateUniteArticleDto extends PartialType(CreateUniteArticleDto) {}