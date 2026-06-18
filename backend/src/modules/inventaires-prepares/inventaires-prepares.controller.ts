import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { InventairesPreparesService } from './inventaires-prepares.service';
import { CreateInventairePrepareDto } from './dto/create-inventaire-prepare.dto';
import { AddLigneInventaireDto } from './dto/add-ligne-inventaire.dto';
import { SaisirQuantitesDto } from './dto/saisir-quantites.dto';

@Controller('inventaires-prepares')
export class InventairesPreparesController {
  constructor(
    private readonly inventairesPreparesService: InventairesPreparesService,
  ) {}

  @Get()
  findAll() {
    return this.inventairesPreparesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventairesPreparesService.findOne(Number(id));
  }

  @Post()
  create(@Body() dto: CreateInventairePrepareDto) {
    return this.inventairesPreparesService.create(dto);
  }

  @Post(':id/lignes')
  addLigne(
    @Param('id') id: string,
    @Body() dto: AddLigneInventaireDto,
  ) {
    return this.inventairesPreparesService.addLigne(Number(id), dto);
  }

  @Post(':id/generer-lignes-depuis-stock')
  genererLignesDepuisStock(@Param('id') id: string) {
    return this.inventairesPreparesService.genererLignesDepuisStock(
      Number(id),
    );
  }

  @Patch(':id/lancer-comptage')
  lancerComptage(@Param('id') id: string) {
    return this.inventairesPreparesService.lancerComptage(Number(id));
  }

  @Patch(':id/saisir-quantites')
  saisirQuantites(
    @Param('id') id: string,
    @Body() dto: SaisirQuantitesDto,
  ) {
    return this.inventairesPreparesService.saisirQuantites(
      Number(id),
      dto,
    );
  }
@Patch(':id/calculer-ecarts')
calculerEcarts(@Param('id') id: string) {
  return this.inventairesPreparesService.calculerEcarts(Number(id));
}
  @Patch(':id/valider')
  validerInventaire(@Param('id') id: string) {
    return this.inventairesPreparesService.validerInventaire(Number(id));
  }

  @Patch(':id/annuler')
  annulerInventaire(@Param('id') id: string) {
    return this.inventairesPreparesService.annulerInventaire(Number(id));
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inventairesPreparesService.remove(Number(id));
  }
}