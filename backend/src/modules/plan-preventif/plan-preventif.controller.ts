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
import { CreatePlanPreventifDto } from './dto/create-plan-preventif.dto';
import { UpdatePlanPreventifDto } from './dto/update-plan-preventif.dto';
import { PlanPreventifService } from './plan-preventif.service';

@Controller('plans-preventifs')
export class PlanPreventifController {
  constructor(private readonly service: PlanPreventifService) {}

  @Post()
  create(@Body() dto: CreatePlanPreventifDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  // Liste globale de tous les déclencheurs réels
  // Nouvelle route pour éviter le conflit avec :id
  @Get('all-declencheurs')
  findAllDeclencheurs() {
    return this.service.findAllDeclencheurs();
  }

  // Génération OT depuis un déclencheur réel
  // Nouvelle route simple pour éviter le conflit avec :id
  @Post('generate-ot/:id')
  generateOtFromDeclencheur(@Param('id', ParseIntPipe) id: number) {
    console.log('ROUTE GENERATE OT APPELEE AVEC ID =', id);
    return this.service.generateOtFromDeclencheur(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePlanPreventifDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Post(':id/regenerate-declencheurs')
  regenerateDeclencheurs(@Param('id', ParseIntPipe) id: number) {
    return this.service.regenerateDeclencheurs(id);
  }

  @Get(':id/declencheurs')
  findDeclencheursByPlan(@Param('id', ParseIntPipe) id: number) {
    return this.service.findDeclencheursByPlan(id);
  }
}