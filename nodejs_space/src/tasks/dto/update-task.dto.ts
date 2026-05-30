import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber } from 'class-validator';

export class UpdateTaskDto extends PartialType(OmitType(CreateTaskDto, ['project_id'])) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  actual_hours?: number;
}
