import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { LivekitService } from './livekit.service';
import { IsString, IsOptional, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CreateRoomDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ default: 300 })
  @IsOptional()
  @IsInt()
  empty_timeout?: number;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @IsInt()
  max_participants?: number;
}

class GenerateTokenDto {
  @ApiProperty()
  @IsString()
  identity: string;

  @ApiProperty()
  @IsString()
  room_name: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  can_publish?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  can_subscribe?: boolean;
}

@ApiTags('LiveKit')
@Controller('livekit')
export class LivekitController {
  constructor(private readonly livekitService: LivekitService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get LiveKit integration status' })
  getStatus() {
    return this.livekitService.getStatus();
  }

  @Post('rooms')
  @ApiOperation({ summary: 'Create a LiveKit room' })
  createRoom(@Body() dto: CreateRoomDto) {
    return this.livekitService.createRoom(dto.name, {
      emptyTimeout: dto.empty_timeout,
      maxParticipants: dto.max_participants,
    });
  }

  @Get('rooms')
  @ApiOperation({ summary: 'List LiveKit rooms' })
  listRooms() {
    return this.livekitService.listRooms();
  }

  @Delete('rooms/:name')
  @ApiOperation({ summary: 'Delete a LiveKit room' })
  @ApiParam({ name: 'name', type: 'string' })
  deleteRoom(@Param('name') name: string) {
    return this.livekitService.deleteRoom(name);
  }

  @Post('token')
  @ApiOperation({ summary: 'Generate a LiveKit access token' })
  generateToken(@Body() dto: GenerateTokenDto) {
    return this.livekitService.generateToken(dto.identity, dto.room_name, {
      canPublish: dto.can_publish,
      canSubscribe: dto.can_subscribe,
    });
  }
}
