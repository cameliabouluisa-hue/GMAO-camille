import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { ReleveMesureService } from './releve-mesure.service';
import { CreateReleveMesureDto } from './dto/create-releve-mesure.dto';
import { UpdateReleveMesureDto } from './dto/update-releve-mesure.dto';

@Controller('releves-mesure')
export class ReleveMesureController {
  constructor(private readonly service: ReleveMesureService) {}

  @Post()
  create(@Body() dto: CreateReleveMesureDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(
    @Query('idPointMesure') idPointMesure?: string,
    @Query('correction') correction?: string,
  ) {
    return this.service.findAll({
      idPointMesure: this.parseOptionalNumber(idPointMesure),
      correction: this.parseOptionalBoolean(correction),
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) idReleveMesure: number) {
    return this.service.findOne(idReleveMesure);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) idReleveMesure: number,
    @Body() dto: UpdateReleveMesureDto,
  ) {
    return this.service.update(idReleveMesure, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) idReleveMesure: number) {
    return this.service.remove(idReleveMesure);
  }

  private parseOptionalNumber(value?: string) {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    const parsed = Number(value);

    return Number.isNaN(parsed) ? undefined : parsed;
  }

  private parseOptionalBoolean(value?: string) {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    if (value === 'true') return true;
    if (value === 'false') return false;

    return undefined;
  }
}