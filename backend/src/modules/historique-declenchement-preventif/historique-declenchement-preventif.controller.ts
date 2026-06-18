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
import { HistoriqueDeclenchementPreventifService } from './historique-declenchement-preventif.service';
import { CreateHistoriqueDeclenchementPreventifDto } from './dto/create-historique-declenchement-preventif.dto';
import { UpdateHistoriqueDeclenchementPreventifDto } from './dto/update-historique-declenchement-preventif.dto';

@Controller('historiques-declenchement-preventif')
export class HistoriqueDeclenchementPreventifController {
  constructor(
    private readonly service: HistoriqueDeclenchementPreventifService,
  ) {}

  @Post()
  create(@Body() dto: CreateHistoriqueDeclenchementPreventifDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Get('declencheur/:id')
  findByDeclencheur(@Param('id', ParseIntPipe) id: number) {
    return this.service.findByDeclencheur(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateHistoriqueDeclenchementPreventifDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}