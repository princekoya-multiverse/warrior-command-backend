import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsInt, IsArray, IsDateString, MaxLength, IsIn } from 'class-validator';

export class CreateEpicDto {
  @ApiProperty()
  @IsUUID()
  project_id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  parent_epic_id?: string;

  @ApiProperty({ maxLength: 200 })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ['planned', 'in_progress', 'completed', 'blocked', 'cancelled'], default: 'planned' })
  @IsOptional()
  @IsIn(['planned', 'in_progress', 'completed', 'blocked', 'cancelled'])
  status?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  priority?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  target_completion?: string;
}
