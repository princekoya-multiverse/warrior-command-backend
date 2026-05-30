import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsNumber, Min, Max, IsIn, IsDateString } from 'class-validator';

export class CreateMemoryDto {
  @ApiProperty()
  @IsUUID()
  user_id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  session_id?: string;

  @ApiProperty({ enum: ['episodic', 'semantic', 'procedural', 'preference', 'fact'] })
  @IsIn(['episodic', 'semantic', 'procedural', 'preference', 'fact'])
  memory_type: string;

  @ApiPropertyOptional({ enum: ['user', 'project', 'global'], default: 'user' })
  @IsOptional()
  @IsIn(['user', 'project', 'global'])
  scope?: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  project_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  task_id?: string;

  @ApiPropertyOptional({ minimum: 0, maximum: 1, default: 0.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  importance_score?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expires_at?: string;
}
