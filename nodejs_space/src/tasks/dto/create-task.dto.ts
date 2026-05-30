import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsInt, IsArray, IsDateString, IsNumber, MaxLength, IsIn } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty()
  @IsUUID()
  project_id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  epic_id?: string;

  @ApiPropertyOptional({ description: 'Parent task ID for subtask creation' })
  @IsOptional()
  @IsUUID()
  parent_task_id?: string;

  @ApiProperty({ maxLength: 300 })
  @IsString()
  @MaxLength(300)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ['todo', 'in_progress', 'review', 'completed', 'blocked', 'cancelled'], default: 'todo' })
  @IsOptional()
  @IsIn(['todo', 'in_progress', 'review', 'completed', 'blocked', 'cancelled'])
  status?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  priority?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  assigned_to?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assigned_agent?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  estimated_hours?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  dependencies?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  due_date?: string;
}
