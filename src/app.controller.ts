import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Health Check')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health-check')
  @ApiOperation({ summary: 'Get health check' })
  @ApiResponse({ status: 200, description: 'Health check OK!' })
  getHealthCheck(): string {
    return this.appService.getHealthCheck();
  }
}
