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
import { EtatModeleService } from './etat-modele.service';
import { CreateEtatModeleDto } from './dto/create-etat-modele.dto';
import { UpdateEtatModeleDto } from './dto/update-etat-modele.dto';

@Controller('etat-modele')
export class EtatModeleController {
  constructor(private readonly etatModeleService: EtatModeleService) {}

  @Get()
  findAll() {
    return this.etatModeleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.etatModeleService.findOne(id);
  }

  @Post()
  create(@Body() createEtatModeleDto: CreateEtatModeleDto) {
    return this.etatModeleService.create(createEtatModeleDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEtatModeleDto: UpdateEtatModeleDto,
  ) {
    return this.etatModeleService.update(id, updateEtatModeleDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.etatModeleService.remove(id);
  }
}