import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get()
  findAll() {
    return this.reservationsService.findAll();
  }

  @Get('stock-disponible')
  getStockDisponible() {
    return this.reservationsService.getStockDisponible();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reservationsService.findOne(Number(id));
  }

  @Post()
  create(@Body() dto: CreateReservationDto) {
    return this.reservationsService.create(dto);
  }

  @Patch(':id/annuler')
  annuler(@Param('id') id: string) {
    return this.reservationsService.annuler(Number(id));
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reservationsService.remove(Number(id));
  }
}