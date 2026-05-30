import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchMemoryDto {
  @ApiProperty({ description: 'Query text for semantic search' })
  @IsString()
  query: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @ApiPropertyOptional({ enum: ['episodic', 'semantic', 'procedural', 'preference', 'fact'] })
  @IsOptional()
  @IsIn(['episodic', 'semantic', 'procedural', 'preference', 'fact'])
  memory_type?: string;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}
