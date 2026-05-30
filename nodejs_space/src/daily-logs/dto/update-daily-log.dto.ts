import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateDailyLogDto } from './create-daily-log.dto';

export class UpdateDailyLogDto extends PartialType(OmitType(CreateDailyLogDto, ['user_id', 'log_date'])) {}
