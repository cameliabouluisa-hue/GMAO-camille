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

import { PointMesureService } from './point-mesure.service';
import { CreatePointMesureDto } from './dto/create-point-mesure.dto';
import { UpdatePointMesureDto } from './dto/update-point-mesure.dto';

@Controller('points-mesure')
export class PointMesureController {
  constructor(private readonly pointMesureService: PointMesureService) {}

  @Post()
  create(@Body() dto: CreatePointMesureDto) {
    return this.pointMesureService.create(dto);
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('actif') actif?: string,
    @Query('idPointStructure') idPointStructure?: string,
    @Query('idMateriel') idMateriel?: string,
  ) {
    return this.pointMesureService.findAll({
      search,
      type,
      actif: this.parseOptionalBoolean(actif),
      idPointStructure: this.parseOptionalNumber(idPointStructure),
      idMateriel: this.parseOptionalNumber(idMateriel),
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) idPointMesure: number) {
    return this.pointMesureService.findOne(idPointMesure);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) idPointMesure: number,
    @Body() dto: UpdatePointMesureDto,
  ) {
    return this.pointMesureService.update(idPointMesure, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) idPointMesure: number) {
    return this.pointMesureService.remove(idPointMesure);
  }

  @Patch(':id/restore')
  restore(@Param('id', ParseIntPipe) idPointMesure: number) {
    return this.pointMesureService.restore(idPointMesure);
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