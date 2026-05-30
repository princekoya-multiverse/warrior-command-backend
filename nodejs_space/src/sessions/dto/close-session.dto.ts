import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';

export class CloseSessionDto {
  @ApiPropertyOptional({ description: 'Whether to generate a handoff for future session continuity', default: true })
  @IsOptional()
  @IsBoolean()
  generate_handoff?: boolean = true;
}
