import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { ReapprovisionnementService } from './reapprovisionnement.service';
import { CreateReapprovisionnementDto } from './dto/create-reapprovisionnement.dto';

@Controller('reapprovisionnements')
export class ReapprovisionnementController {
  constructor(
    private readonly reapprovisionnementService: ReapprovisionnementService,
  ) {}

  @Get()
  findAll() {
    return this.reapprovisionnementService.findAll();
  }

  @Get('stock-disponible')
  getStockDisponible(@Query('idMagasin') idMagasin?: string) {
    return this.reapprovisionnementService.getStockDisponible(
      idMagasin ? Number(idMagasin) : undefined,
    );
  }

  @Get('suggestions-stock-bas')
  getSuggestionsStockBas(
    @Query('seuil') seuil?: string,
    @Query('idMagasin') idMagasin?: string,
  ) {
    return this.reapprovisionnementService.getSuggestionsStockBas(
      seuil ? Number(seuil) : 5,
      idMagasin ? Number(idMagasin) : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reapprovisionnementService.findOne(Number(id));
  }

  @Post()
  create(@Body() dto: CreateReapprovisionnementDto) {
    return this.reapprovisionnementService.create(dto);
  }

  @Patch(':id/valider')
  valider(@Param('id') id: string) {
    return this.reapprovisionnementService.valider(Number(id));
  }

  @Patch(':id/annuler')
  annuler(@Param('id') id: string) {
    return this.reapprovisionnementService.annuler(Number(id));
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reapprovisionnementService.remove(Number(id));
  }
}