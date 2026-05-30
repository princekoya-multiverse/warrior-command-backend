import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task or subtask' })
  create(@Body() dto: CreateTaskDto) {
    return this.tasksService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List tasks with filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'project_id', required: false })
  @ApiQuery({ name: 'epic_id', required: false })
  @ApiQuery({ name: 'assigned_to', required: false })
  @ApiQuery({ name: 'assigned_agent', required: false })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('project_id') projectId?: string,
    @Query('epic_id') epicId?: string,
    @Query('assigned_to') assignedTo?: string,
    @Query('assigned_agent') assignedAgent?: string,
  ) {
    return this.tasksService.findAll(page ? +page : 1, limit ? +limit : 20, {
      status, projectId, epicId, assignedTo, assignedAgent,
    });
  }

  @Get('today')
  @ApiOperation({ summary: 'Get tasks for today (due today + in-progress + blocked)' })
  @ApiQuery({ name: 'user_id', required: false })
  getToday(@Query('user_id') userId?: string) {
    return this.tasksService.getTodayTasks(userId);
  }

  @Get('week')
  @ApiOperation({ summary: 'Get tasks for this week' })
  @ApiQuery({ name: 'user_id', required: false })
  getWeek(@Query('user_id') userId?: string) {
    return this.tasksService.getWeekTasks(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID with subtasks' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.findOne(id);
  }

  @Get(':id/subtasks')
  @ApiOperation({ summary: 'Get subtasks for a task' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  getSubtasks(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.getSubtasks(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update task' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete task' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.remove(id);
  }
}
