import { Controller, Get } from '@nestjs/common';
import { FabricantService } from './fabricant.service';

@Controller('fabricants')
export class FabricantController {
  constructor(private readonly fabricantService: FabricantService) {}

  @Get()
  findAll() {
    return this.fabricantService.findAll();
  }
}