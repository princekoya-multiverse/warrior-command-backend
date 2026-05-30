import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('System')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'API root - service info' })
  getInfo() {
    return this.appService.getInfo();
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  healthCheck() {
    return this.appService.healthCheck();
  }
}
