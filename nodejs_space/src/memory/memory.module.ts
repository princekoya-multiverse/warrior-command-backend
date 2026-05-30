import { Module } from '@nestjs/common';
import { MemoryController } from './memory.controller';
import { MemoryService } from './memory.service';
import { LlmModule } from '../llm/llm.module';
import { QdrantModule } from '../qdrant/qdrant.module';

@Module({
  imports: [LlmModule, QdrantModule],
  controllers: [MemoryController],
  providers: [MemoryService],
  exports: [MemoryService],
})
export class MemoryModule {}
