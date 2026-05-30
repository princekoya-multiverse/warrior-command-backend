import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, MaxLength, IsIn } from 'class-validator';

export class CreateAgentDto {
  @ApiProperty({ maxLength: 100 })
  @IsString()
  @MaxLength(100)
  identifier: string;

  @ApiProperty({ maxLength: 200 })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ['assistant', 'specialist', 'autonomous'], default: 'assistant' })
  @IsOptional()
  @IsIn(['assistant', 'specialist', 'autonomous'])
  type?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  capabilities?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  config?: Record<string, any>;
}
