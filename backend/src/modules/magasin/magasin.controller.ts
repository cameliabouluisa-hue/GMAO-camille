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
import { MagasinService } from './magasin.service';
import { CreateMagasinDto } from './dto/create-magasin.dto';
import { UpdateMagasinDto } from './dto/update-magasin.dto';
import { CreateEmplacementMagasinDto } from './dto/create-emplacement-magasin.dto';
import { UpdateEmplacementMagasinDto } from './dto/update-emplacement-magasin.dto';

@Controller('magasins')
export class MagasinController {
  constructor(private readonly magasinService: MagasinService) {}

  /* =========================
     MAGASINS
  ========================= */

  @Post()
  create(@Body() dto: CreateMagasinDto) {
    return this.magasinService.create(dto);
  }

  @Get()
  findAll() {
    return this.magasinService.findAll();
  }

  /*
    Important :
    cette route doit être AVANT @Get(':id')
  */
  @Get(':id/emplacements')
  findEmplacementsByMagasin(@Param('id', ParseIntPipe) id: number) {
    return this.magasinService.findEmplacementsByMagasin(id);
  }

  @Post(':id/emplacements')
  createEmplacement(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateEmplacementMagasinDto,
  ) {
    return this.magasinService.createEmplacement(id, dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.magasinService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMagasinDto,
  ) {
    return this.magasinService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.magasinService.remove(id);
  }

  /* =========================
     EMPLACEMENTS MAGASIN
  ========================= */

  @Patch('emplacements/:idEmplacement')
  updateEmplacement(
    @Param('idEmplacement', ParseIntPipe) idEmplacement: number,
    @Body() dto: UpdateEmplacementMagasinDto,
  ) {
    return this.magasinService.updateEmplacement(idEmplacement, dto);
  }

  @Delete('emplacements/:idEmplacement')
  removeEmplacement(
    @Param('idEmplacement', ParseIntPipe) idEmplacement: number,
  ) {
    return this.magasinService.removeEmplacement(idEmplacement);
  }
}