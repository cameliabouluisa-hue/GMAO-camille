import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { UniteArticleService } from './unite-article.service';
import { CreateUniteArticleDto } from './dto/create-unite-article.dto';
import { UpdateUniteArticleDto } from './dto/update-unite-article.dto';

@Controller('unites-articles')
export class UniteArticleController {
  constructor(private readonly uniteArticleService: UniteArticleService) {}

  @Post()
  create(@Body() createDto: CreateUniteArticleDto) {
    return this.uniteArticleService.create(createDto);
  }

  @Get()
  findAll() {
    return this.uniteArticleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.uniteArticleService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateUniteArticleDto,
  ) {
    return this.uniteArticleService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.uniteArticleService.remove(id);
  }
}