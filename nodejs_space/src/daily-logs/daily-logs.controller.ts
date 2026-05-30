import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { DailyLogsService } from './daily-logs.service';
import { CreateDailyLogDto } from './dto/create-daily-log.dto';
import { UpdateDailyLogDto } from './dto/update-daily-log.dto';

@ApiTags('Daily Logs')
@Controller('daily-logs')
export class DailyLogsController {
  constructor(private readonly dailyLogsService: DailyLogsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a daily log entry' })
  create(@Body() dto: CreateDailyLogDto) {
    return this.dailyLogsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List daily logs' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'user_id', required: false })
  @ApiQuery({ name: 'project_id', required: false })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('user_id') userId?: string,
    @Query('project_id') projectId?: string,
  ) {
    return this.dailyLogsService.findAll(page ? +page : 1, limit ? +limit : 20, userId, projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get daily log by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.dailyLogsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update daily log' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateDailyLogDto) {
    return this.dailyLogsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete daily log' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.dailyLogsService.remove(id);
  }
}
