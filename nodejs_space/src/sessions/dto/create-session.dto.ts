import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsArray, IsIn, MaxLength } from 'class-validator';

export class CreateSessionDto {
  @ApiProperty()
  @IsUUID()
  user_id: string;

  @ApiPropertyOptional({ enum: ['general', 'project_focused', 'agent_call'], default: 'general' })
  @IsOptional()
  @IsIn(['general', 'project_focused', 'agent_call'])
  session_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  livekit_room_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  project_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  parent_session_id?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  agent_identifiers?: string[];
}
