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
import { PlanPreventifPredefiniService } from './plan-preventif-predefini.service';
import { CreatePlanPreventifPredefiniDto } from './dto/create-plan-preventif-predefini.dto';
import { UpdatePlanPreventifPredefiniDto } from './dto/update-plan-preventif-predefini.dto';
import { CreatePppDeclencheurDto } from './dto/create-ppp-declencheur.dto';
import { UpdatePppDeclencheurDto } from './dto/update-ppp-declencheur.dto';

@Controller('plans-preventifs-predefinis')
export class PlanPreventifPredefiniController {
  constructor(
    private readonly service: PlanPreventifPredefiniService,
  ) {}

  @Post()
  create(@Body() dto: CreatePlanPreventifPredefiniDto) {
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

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePlanPreventifPredefiniDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Post(':id/declencheurs')
  createDeclencheur(
    @Param('id', ParseIntPipe) idPlanPreventifPredefini: number,
    @Body() dto: CreatePppDeclencheurDto,
  ) {
    return this.service.createDeclencheur(idPlanPreventifPredefini, dto);
  }

  @Get(':id/declencheurs')
  findDeclencheursByPlan(
    @Param('id', ParseIntPipe) idPlanPreventifPredefini: number,
  ) {
    return this.service.findDeclencheursByPlan(idPlanPreventifPredefini);
  }

  @Patch('declencheurs/:id')
  updateDeclencheur(
    @Param('id', ParseIntPipe) idDeclencheur: number,
    @Body() dto: UpdatePppDeclencheurDto,
  ) {
    return this.service.updateDeclencheur(idDeclencheur, dto);
  }

  @Delete('declencheurs/:id')
  removeDeclencheur(@Param('id', ParseIntPipe) idDeclencheur: number) {
    return this.service.removeDeclencheur(idDeclencheur);
  }
}