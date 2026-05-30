import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateEpicDto } from './create-epic.dto';

export class UpdateEpicDto extends PartialType(OmitType(CreateEpicDto, ['project_id'])) {}
