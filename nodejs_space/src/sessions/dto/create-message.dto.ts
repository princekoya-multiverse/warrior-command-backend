import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsIn, IsInt, MaxLength } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty()
  @IsUUID()
  session_id: string;

  @ApiProperty({ enum: ['user', 'assistant', 'system', 'tool'] })
  @IsIn(['user', 'assistant', 'system', 'tool'])
  role: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  agent_identifier?: string;

  @ApiPropertyOptional()
  @IsOptional()
  tool_calls?: any;

  @ApiPropertyOptional()
  @IsOptional()
  tool_results?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  token_count?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  latency_ms?: number;
}
