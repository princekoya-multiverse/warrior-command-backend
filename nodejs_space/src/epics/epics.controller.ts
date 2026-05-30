import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { EpicsService } from './epics.service';
import { CreateEpicDto } from './dto/create-epic.dto';
import { UpdateEpicDto } from './dto/update-epic.dto';

@ApiTags('Epics')
@Controller('epics')
export class EpicsController {
  constructor(private readonly epicsService: EpicsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new epic' })
  create(@Body() dto: CreateEpicDto) {
    return this.epicsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List epics' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'project_id', required: false })
  @ApiQuery({ name: 'status', required: false })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('project_id') projectId?: string,
    @Query('status') status?: string,
  ) {
    return this.epicsService.findAll(page ? +page : 1, limit ? +limit : 20, projectId, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get epic by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.epicsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update epic' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateEpicDto) {
    return this.epicsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete epic' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.epicsService.remove(id);
  }
}
