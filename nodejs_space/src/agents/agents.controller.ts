import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AgentsService } from './agents.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';

@ApiTags('Agents')
@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new AI agent' })
  create(@Body() dto: CreateAgentDto) {
    return this.agentsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all agents' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.agentsService.findAll(page ? +page : 1, limit ? +limit : 20);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get agent by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.agentsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update agent' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAgentDto) {
    return this.agentsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete agent' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.agentsService.remove(id);
  }
}
