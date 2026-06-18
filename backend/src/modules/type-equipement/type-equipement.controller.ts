import { Controller, Get } from '@nestjs/common';
import { TypeEquipementService } from './type-equipement.service';

@Controller('type-equipements')
export class TypeEquipementController {
  constructor(
    private readonly typeEquipementService: TypeEquipementService,
  ) {}

  @Get()
  findAll() {
    return this.typeEquipementService.findAll();
  }
}