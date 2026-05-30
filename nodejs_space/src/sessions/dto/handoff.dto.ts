import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString, IsIn } from 'class-validator';

export class InitiateHandoffDto {
  @ApiProperty({ description: 'Session ID to close and summarize' })
  @IsUUID()
  source_session_id: string;

  @ApiPropertyOptional({ description: 'User ID to create new session for' })
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @ApiPropertyOptional({ enum: ['general', 'project_focused', 'agent_call'] })
  @IsOptional()
  @IsIn(['general', 'project_focused', 'agent_call'])
  new_session_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  project_id?: string;
}

export class ResumeSessionDto {
  @ApiProperty({ description: 'User ID to resume session for' })
  @IsUUID()
  user_id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  session_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  project_id?: string;
}
