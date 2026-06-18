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
import { GammeService } from './gamme.service';
import { CreateGammeDto } from './dto/create-gamme.dto';
import { UpdateGammeDto } from './dto/update-gamme.dto';
import { CreateGammeOperationDto } from './dto/create-gamme-operation.dto';
import { UpdateGammeOperationDto } from './dto/update-gamme-operation.dto';

@Controller('gammes')
export class GammeController {
  constructor(private readonly gammeService: GammeService) {}

  @Post()
  create(@Body() createGammeDto: CreateGammeDto) {
    return this.gammeService.create(createGammeDto);
  }

  @Get()
  findAll() {
    return this.gammeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gammeService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGammeDto: UpdateGammeDto,
  ) {
    return this.gammeService.update(id, updateGammeDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gammeService.remove(id);
  }

  @Post(':id/operations')
  createOperation(
    @Param('id', ParseIntPipe) idGamme: number,
    @Body() createGammeOperationDto: CreateGammeOperationDto,
  ) {
    return this.gammeService.createOperation(
      idGamme,
      createGammeOperationDto,
    );
  }

  @Get(':id/operations')
  findOperationsByGamme(@Param('id', ParseIntPipe) idGamme: number) {
    return this.gammeService.findOperationsByGamme(idGamme);
  }

  @Patch('operations/:id')
  updateOperation(
    @Param('id', ParseIntPipe) idOperation: number,
    @Body() updateGammeOperationDto: UpdateGammeOperationDto,
  ) {
    return this.gammeService.updateOperation(
      idOperation,
      updateGammeOperationDto,
    );
  }

  @Delete('operations/:id')
  removeOperation(@Param('id', ParseIntPipe) idOperation: number) {
    return this.gammeService.removeOperation(idOperation);
  }
}