import { Controller, Get, Post, Delete, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { MemoryService } from './memory.service';
import { CreateMemoryDto } from './dto/create-memory.dto';
import { SearchMemoryDto } from './dto/search-memory.dto';

@ApiTags('Memory')
@Controller('memory')
export class MemoryController {
  constructor(private readonly memoryService: MemoryService) {}

  @Post()
  @ApiOperation({ summary: 'Store a new memory entry' })
  create(@Body() dto: CreateMemoryDto) {
    return this.memoryService.create(dto);
  }

  @Post('search')
  @ApiOperation({ summary: 'Semantic search across agent memories' })
  search(@Body() dto: SearchMemoryDto) {
    return this.memoryService.search(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List memories' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'user_id', required: false })
  @ApiQuery({ name: 'memory_type', required: false })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('user_id') userId?: string,
    @Query('memory_type') memoryType?: string,
  ) {
    return this.memoryService.findAll(page ? +page : 1, limit ? +limit : 20, userId, memoryType);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get memory by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.memoryService.findOne(id);
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive a memory entry' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  archive(@Param('id', ParseUUIDPipe) id: string) {
    return this.memoryService.archive(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete memory entry' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.memoryService.remove(id);
  }
}
