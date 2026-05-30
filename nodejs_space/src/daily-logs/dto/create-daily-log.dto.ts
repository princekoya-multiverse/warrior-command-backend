import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsArray, IsInt, Min, Max, IsDateString, IsIn } from 'class-validator';

export class CreateDailyLogDto {
  @ApiProperty()
  @IsUUID()
  user_id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  project_id?: string;

  @ApiProperty({ description: 'Date in YYYY-MM-DD format' })
  @IsDateString()
  log_date: string;

  @ApiProperty()
  @IsString()
  summary: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  accomplishments?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  blockers?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  next_actions?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  tasks_completed?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  tasks_started?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['great', 'good', 'neutral', 'tired', 'stressed'])
  mood?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  energy_level?: number;
}
