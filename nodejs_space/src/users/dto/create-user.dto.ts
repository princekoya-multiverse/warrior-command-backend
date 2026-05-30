import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsIn, MaxLength } from 'class-validator';

export class CreateUserDto {
  @ApiPropertyOptional({ maxLength: 44 })
  @IsOptional()
  @IsString()
  @MaxLength(44)
  wallet_address?: string;

  @ApiProperty({ maxLength: 50 })
  @IsString()
  @MaxLength(50)
  username: string;

  @ApiPropertyOptional({ maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  display_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ enum: ['operator', 'admin', 'signatory'], default: 'operator' })
  @IsOptional()
  @IsIn(['operator', 'admin', 'signatory'])
  role?: string;
}
