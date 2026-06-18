import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { DemandesTransfertService } from './demandes-transfert.service';
import { CreateDemandeTransfertDto } from './dto/create-demande-transfert.dto';

@Controller('demandes-transfert')
export class DemandesTransfertController {
  constructor(
    private readonly demandesTransfertService: DemandesTransfertService,
  ) {}

  @Get()
  findAll() {
    return this.demandesTransfertService.findAll();
  }

  @Get('stock-disponible')
  stockDisponible() {
    return this.demandesTransfertService.stockDisponible();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.demandesTransfertService.findOne(Number(id));
  }

  @Post()
  create(@Body() dto: CreateDemandeTransfertDto) {
    return this.demandesTransfertService.create(dto);
  }

  @Patch(':id/valider')
  valider(@Param('id') id: string) {
    return this.demandesTransfertService.valider(Number(id));
  }

  @Patch(':id/executer')
  executer(@Param('id') id: string) {
    return this.demandesTransfertService.executer(Number(id));
  }

  @Patch(':id/annuler')
  annuler(@Param('id') id: string) {
    return this.demandesTransfertService.annuler(Number(id));
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.demandesTransfertService.remove(Number(id));
  }
}