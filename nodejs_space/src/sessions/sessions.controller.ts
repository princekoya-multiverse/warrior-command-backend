import { Controller, Get, Post, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { CloseSessionDto } from './dto/close-session.dto';
import { InitiateHandoffDto, ResumeSessionDto } from './dto/handoff.dto';

@ApiTags('Sessions')
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new session' })
  create(@Body() dto: CreateSessionDto) {
    return this.sessionsService.createSession(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List sessions' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'user_id', required: false })
  @ApiQuery({ name: 'status', required: false })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('user_id') userId?: string,
    @Query('status') status?: string,
  ) {
    return this.sessionsService.findAll(page ? +page : 1, limit ? +limit : 20, userId, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get session by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.sessionsService.findOne(id);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Get messages for a session' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getMessages(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.sessionsService.getMessages(id, page ? +page : 1, limit ? +limit : 50);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Add a message to a session' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  addMessage(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateMessageDto) {
    dto.session_id = id;
    return this.sessionsService.addMessage(dto);
  }

  @Post(':id/close')
  @ApiOperation({ summary: 'Close a session and optionally generate handoff summary' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  close(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CloseSessionDto) {
    return this.sessionsService.closeSession(id, dto.generate_handoff ?? true);
  }

  @Get(':id/context')
  @ApiOperation({ summary: 'Retrieve context for a session (memory retrieval)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async getContext(@Param('id', ParseUUIDPipe) id: string) {
    const session = await this.sessionsService.findOne(id);
    return this.sessionsService.getSessionContext(session.user_id);
  }

  @Post('handoff')
  @ApiOperation({ summary: 'Close current session and start new one with context (full handoff protocol)' })
  handoff(@Body() dto: InitiateHandoffDto) {
    return this.sessionsService.initiateHandoff(dto);
  }

  @Post('resume')
  @ApiOperation({ summary: 'Start a new session with context from previous sessions' })
  resume(@Body() dto: ResumeSessionDto) {
    return this.sessionsService.resumeSession(dto);
  }
}
