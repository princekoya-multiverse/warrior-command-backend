import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LlmService } from '../llm/llm.service';
import { QdrantService } from '../qdrant/qdrant.service';
import { CreateMemoryDto } from './dto/create-memory.dto';
import { SearchMemoryDto } from './dto/search-memory.dto';

@Injectable()
export class MemoryService {
  private readonly logger = new Logger(MemoryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly llmService: LlmService,
    private readonly qdrantService: QdrantService,
  ) {}

  async create(dto: CreateMemoryDto) {
    // 1. Generate embedding
    const embedding = await this.llmService.generateEmbedding(dto.content);

    // 2. Store in Qdrant
    const vectorId = await this.qdrantService.upsert('agent_memories', embedding, {
      userId: dto.user_id,
      sessionId: dto.session_id,
      projectId: dto.project_id,
      taskId: dto.task_id,
      memoryType: dto.memory_type,
      scope: dto.scope || 'user',
      content: dto.content,
      summary: dto.summary,
      importanceScore: dto.importance_score || 0.5,
      timestamp: Date.now(),
    });

    // 3. Store in PostgreSQL
    return this.prisma.agent_memory.create({
      data: {
        ...dto,
        vector_id: vectorId,
        expires_at: dto.expires_at ? new Date(dto.expires_at) : undefined,
      },
    });
  }

  async search(dto: SearchMemoryDto) {
    const embedding = await this.llmService.generateEmbedding(dto.query);
    const filter: Record<string, any> = {};
    if (dto.user_id) filter.userId = dto.user_id;
    if (dto.memory_type) filter.memoryType = dto.memory_type;

    const vectorResults = await this.qdrantService.search(
      'agent_memories', embedding, Object.keys(filter).length > 0 ? filter : undefined, dto.limit || 10,
    );

    // Update access counts
    const ids = vectorResults
      .map(r => r.payload?.vectorId)
      .filter(Boolean);

    return {
      results: vectorResults.map(r => ({
        score: r.score,
        ...r.payload,
      })),
      vectorStoreAvailable: this.qdrantService.getAvailability(),
    };
  }

  async findAll(page = 1, limit = 20, userId?: string, memoryType?: string) {
    const where: any = { archived: false };
    if (userId) where.user_id = userId;
    if (memoryType) where.memory_type = memoryType;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.agent_memory.findMany({
        where, skip, take: limit,
        orderBy: { importance_score: 'desc' },
      }),
      this.prisma.agent_memory.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const memory = await this.prisma.agent_memory.findUnique({ where: { id } });
    if (!memory) throw new NotFoundException(`Memory ${id} not found`);
    // Update access
    await this.prisma.agent_memory.update({
      where: { id },
      data: { access_count: { increment: 1 }, last_accessed: new Date() },
    });
    return memory;
  }

  async archive(id: string) {
    await this.findOne(id);
    return this.prisma.agent_memory.update({ where: { id }, data: { archived: true } });
  }

  async remove(id: string) {
    const memory = await this.findOne(id);
    if (memory.vector_id) {
      await this.qdrantService.delete('agent_memories', [memory.vector_id]);
    }
    return this.prisma.agent_memory.delete({ where: { id } });
  }
}
