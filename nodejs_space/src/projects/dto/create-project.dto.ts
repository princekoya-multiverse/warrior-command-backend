import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsInt, IsArray, IsDateString, MaxLength, IsIn } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty()
  @IsUUID()
  owner_id: string;

  @ApiProperty({ maxLength: 200 })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ['active', 'paused', 'completed', 'archived'], default: 'active' })
  @IsOptional()
  @IsIn(['active', 'paused', 'completed', 'archived'])
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
  started_at?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  target_completion?: string;
}
