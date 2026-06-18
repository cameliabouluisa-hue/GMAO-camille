import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboards')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('general')
  getGeneralDashboard() {
    return this.dashboardService.getGeneralDashboard();
  }

  @Get('equipements')
  getEquipementsDashboard() {
    return this.dashboardService.getEquipementsDashboard();
  }

  @Get('maintenance')
  getMaintenanceDashboard() {
    return this.dashboardService.getMaintenanceDashboard();
  }

  @Get('stock')
  getStockDashboard() {
    return this.dashboardService.getStockDashboard();
  }
}