import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { InventaireService } from './inventaire.service';
import { ValiderInventaireDto } from './dto/valider-inventaire.dto';

@Controller('inventaire')
export class InventaireController {
  constructor(private readonly inventaireService: InventaireService) {}

  @Get('magasins')
  findMagasins() {
    return this.inventaireService.findMagasins();
  }

  @Get()
  findStock(
    @Query('idMagasin') idMagasin?: string,
    @Query('search') search?: string,
  ) {
    return this.inventaireService.findStock(
      idMagasin ? Number(idMagasin) : undefined,
      search,
    );
  }

  @Post('valider')
  validerInventaire(@Body() dto: ValiderInventaireDto) {
    return this.inventaireService.validerInventaire(dto);
  }
}