import { Module } from '@nestjs/common';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { LlmModule } from '../llm/llm.module';
import { QdrantModule } from '../qdrant/qdrant.module';

@Module({
  imports: [LlmModule, QdrantModule],
  controllers: [SessionsController],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}
