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

import { StockService } from './stock.service';
import {
  EntreeStockDto,
  LigneEntreeStockDto,
  UpdateEntreeStockDto,
  UpdateLigneEntreeStockDto,
} from './dto/entree-stock.dto';
import { SortieStockDto } from './dto/sortie-stock.dto';
import { UpdateSortieStockDto } from './dto/update-sortie-stock.dto';
import { LigneSortieStockCrudDto } from './dto/ligne-sortie-stock-crud.dto';
import { UpdateLigneSortieStockDto } from './dto/update-ligne-sortie-stock.dto';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get()
  findAllStock() {
    return this.stockService.findAllStock();
  }

  @Get('mouvements')
  findAllMouvements() {
    return this.stockService.findAllMouvements();
  }

  @Get('entrees')
  findEntrees() {
    return this.stockService.findEntrees();
  }

  @Get('entrees/:id')
  findEntreeById(@Param('id', ParseIntPipe) id: number) {
    return this.stockService.findEntreeById(id);
  }

  @Post('entrees')
  entreeStock(@Body() dto: EntreeStockDto) {
    return this.stockService.entreeStock(dto);
  }
  @Patch('entrees/:id')
updateEntree(
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: UpdateEntreeStockDto,
) {
  return this.stockService.updateEntreeStock(id, dto);
}

@Post('entrees/:id/lignes')
addEntreeLigne(
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: LigneEntreeStockDto,
) {
  return this.stockService.addEntreeStockLigne(id, dto);
}

@Patch('entrees/:id/lignes/:idLigne')
updateEntreeLigne(
  @Param('id', ParseIntPipe) id: number,
  @Param('idLigne', ParseIntPipe) idLigne: number,
  @Body() dto: UpdateLigneEntreeStockDto,
) {
  return this.stockService.updateEntreeStockLigne(id, idLigne, dto);
}

@Delete('entrees/:id/lignes/:idLigne')
deleteEntreeLigne(
  @Param('id', ParseIntPipe) id: number,
  @Param('idLigne', ParseIntPipe) idLigne: number,
) {
  return this.stockService.deleteEntreeStockLigne(id, idLigne);
}

  @Get('sorties')
  findSorties() {
    return this.stockService.findSorties();
  }

  @Get('sorties/:id')
  findSortieById(@Param('id', ParseIntPipe) id: number) {
    return this.stockService.findSortieById(id);
  }

  @Post('sorties')
  sortieStock(@Body() dto: SortieStockDto) {
    return this.stockService.sortieStock(dto);
  }

  @Patch('sorties/:id')
  updateSortie(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSortieStockDto,
  ) {
    return this.stockService.updateSortieStock(id, dto);
  }

  @Post('sorties/:id/lignes')
  addSortieLigne(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: LigneSortieStockCrudDto,
  ) {
    return this.stockService.addSortieStockLigne(id, dto);
  }

  @Patch('sorties/:id/lignes/:idLigne')
  updateSortieLigne(
    @Param('id', ParseIntPipe) id: number,
    @Param('idLigne', ParseIntPipe) idLigne: number,
    @Body() dto: UpdateLigneSortieStockDto,
  ) {
    return this.stockService.updateLigneSortieStock(id, idLigne, dto);
  }

  @Delete('sorties/:id/lignes/:idLigne')
  deleteSortieLigne(
    @Param('id', ParseIntPipe) id: number,
    @Param('idLigne', ParseIntPipe) idLigne: number,
  ) {
    return this.stockService.deleteSortieStockLigne(id, idLigne);
  }
}