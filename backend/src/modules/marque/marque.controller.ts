import { Controller, Get } from '@nestjs/common';
import { MarqueService } from './marque.service';

@Controller('marques')
export class MarqueController {
  constructor(private readonly marqueService: MarqueService) {}

  @Get()
  findAll() {
    return this.marqueService.findAll();
  }
}