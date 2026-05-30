import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LlmService } from '../llm/llm.service';
import { QdrantService } from '../qdrant/qdrant.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { InitiateHandoffDto, ResumeSessionDto } from './dto/handoff.dto';

@Injectable()
export class SessionsService {
  private readonly logger = new Logger(SessionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly llmService: LlmService,
    private readonly qdrantService: QdrantService,
  ) {}

  async createSession(dto: CreateSessionDto) {
    return this.prisma.session.create({
      data: dto,
    });
  }

  async findAll(page = 1, limit = 20, userId?: string, status?: string) {
    const where: any = {};
    if (userId) where.user_id = userId;
    if (status) where.status = status;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.session.findMany({
        where, skip, take: limit,
        orderBy: { started_at: 'desc' },
        include: { _count: { select: { messages: true } } },
      }),
      this.prisma.session.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const session = await this.prisma.session.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, username: true, display_name: true } },
        project: { select: { id: true, name: true } },
        _count: { select: { messages: true } },
      },
    });
    if (!session) throw new NotFoundException(`Session ${id} not found`);
    return session;
  }

  async getMessages(sessionId: string, page = 1, limit = 50) {
    await this.findOne(sessionId);
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { session_id: sessionId },
        skip, take: limit,
        orderBy: { created_at: 'asc' },
      }),
      this.prisma.message.count({ where: { session_id: sessionId } }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async addMessage(dto: CreateMessageDto) {
    const session = await this.findOne(dto.session_id);
    if (session.status !== 'active') {
      throw new BadRequestException('Cannot add messages to a non-active session');
    }
    const message = await this.prisma.message.create({ data: dto });
    await this.prisma.session.update({
      where: { id: dto.session_id },
      data: {
        total_messages: { increment: 1 },
        total_tokens_used: dto.token_count ? { increment: dto.token_count } : undefined,
      },
    });
    return message;
  }

  async closeSession(id: string, generateHandoff = true) {
    const session = await this.findOne(id);
    if (session.status !== 'active') {
      throw new BadRequestException('Session is not active');
    }

    const endedAt = new Date();
    const durationSeconds = Math.floor((endedAt.getTime() - session.started_at.getTime()) / 1000);

    let handoffSummary: string | null = null;
    let handoffContext: any = null;

    if (generateHandoff) {
      const messages = await this.prisma.message.findMany({
        where: { session_id: id },
        orderBy: { created_at: 'asc' },
        take: 100,
      });

      if (messages.length > 0) {
        const summary = await this.llmService.generateSummary(
          messages.map(m => ({ role: m.role, content: m.content })),
        );
        handoffSummary = summary.executiveSummary;
        handoffContext = {
          decisions: summary.decisions,
          actions: summary.actions,
          projectContext: summary.projectContext,
        };

        // Store in Qdrant
        const embedding = await this.llmService.generateEmbedding(handoffSummary);
        await this.qdrantService.upsert('session_history', embedding, {
          userId: session.user_id,
          sessionId: id,
          content: handoffSummary,
          summary: handoffSummary,
          timestamp: Date.now(),
          metadata: { decisions: summary.decisions, actions: summary.actions },
        });

        // Create handoff record
        await this.prisma.session_handoff.create({
          data: {
            source_session_id: id,
            summary: handoffSummary,
            key_decisions: summary.decisions,
            pending_actions: summary.actions,
            context_snapshot: handoffContext,
          },
        });

        // Create memory entries for important decisions
        for (const decision of summary.decisions || []) {
          const decisionEmbedding = await this.llmService.generateEmbedding(
            `${decision.title}: ${decision.decision}`,
          );
          const vectorId = await this.qdrantService.upsert('agent_memories', decisionEmbedding, {
            userId: session.user_id,
            sessionId: id,
            memoryType: 'semantic',
            scope: 'user',
            content: `${decision.title}: ${decision.decision}`,
            importanceScore: decision.importance || 0.7,
            timestamp: Date.now(),
          });

          await this.prisma.agent_memory.create({
            data: {
              user_id: session.user_id,
              session_id: id,
              memory_type: 'semantic',
              scope: 'user',
              content: `${decision.title}: ${decision.decision}`,
              summary: decision.title,
              vector_id: vectorId,
              importance_score: decision.importance || 0.7,
              project_id: session.project_id,
            },
          });
        }
      }
    }

    return this.prisma.session.update({
      where: { id },
      data: {
        status: generateHandoff ? 'handed_off' : 'completed',
        ended_at: endedAt,
        duration_seconds: durationSeconds,
        handoff_summary: handoffSummary,
        handoff_context: handoffContext,
      },
    });
  }

  async initiateHandoff(dto: InitiateHandoffDto) {
    // 1. Close and summarize source session
    const closedSession = await this.closeSession(dto.source_session_id, true);

    // 2. Get context for new session
    const context = await this.getSessionContext(dto.user_id || closedSession.user_id);

    // 3. Create new session linked to source
    const newSession = await this.prisma.session.create({
      data: {
        user_id: dto.user_id || closedSession.user_id,
        session_type: dto.new_session_type || closedSession.session_type,
        project_id: dto.project_id || closedSession.project_id,
        parent_session_id: dto.source_session_id,
      },
    });

    // 4. Update handoff with target session
    await this.prisma.session_handoff.updateMany({
      where: { source_session_id: dto.source_session_id, target_session_id: null },
      data: { target_session_id: newSession.id },
    });

    return {
      closed_session: closedSession,
      new_session: newSession,
      context,
    };
  }

  async resumeSession(dto: ResumeSessionDto) {
    const context = await this.getSessionContext(dto.user_id);
    const newSession = await this.prisma.session.create({
      data: {
        user_id: dto.user_id,
        session_type: dto.session_type || 'general',
        project_id: dto.project_id,
        parent_session_id: context.previousSessionId || undefined,
      },
    });
    return { session: newSession, context };
  }

  async getSessionContext(userId: string) {
    // 1. Get latest handoff
    const latestHandoff = await this.prisma.session_handoff.findFirst({
      where: { source_session: { user_id: userId } },
      orderBy: { created_at: 'desc' },
      include: { source_session: { select: { id: true, project_id: true } } },
    });

    if (!latestHandoff) {
      return { isNew: true, context: null };
    }

    // 2. Get recent memories
    const memories = await this.prisma.agent_memory.findMany({
      where: { user_id: userId, archived: false },
      orderBy: { importance_score: 'desc' },
      take: 20,
    });

    // 3. Semantic search in Qdrant
    let semanticContext: any[] = [];
    if (latestHandoff.summary) {
      const embedding = await this.llmService.generateEmbedding(latestHandoff.summary);
      semanticContext = await this.qdrantService.search('agent_memories', embedding, { userId }, 10);
    }

    // 4. Build system prompt context
    const systemPrompt = this.buildSystemPrompt(latestHandoff, memories, semanticContext);

    return {
      isNew: false,
      previousSessionId: latestHandoff.source_session_id,
      handoffId: latestHandoff.id,
      summary: latestHandoff.summary,
      decisions: latestHandoff.key_decisions,
      pendingActions: latestHandoff.pending_actions,
      memories: memories.map(m => ({
        type: m.memory_type,
        content: m.content,
        importance: m.importance_score,
      })),
      semanticContext: semanticContext.map(r => r.payload),
      systemPrompt,
    };
  }

  private buildSystemPrompt(
    handoff: any,
    memories: any[],
    semanticContext: any[],
  ): string {
    const decisions = (handoff.key_decisions as any[] || []);
    const actions = (handoff.pending_actions as any[] || []);
    const preferences = memories.filter(m => m.memory_type === 'preference');

    return `You are the Warrior Command Center AI assistant.

PREVIOUS SESSION CONTEXT:
${handoff.summary || 'No previous context.'}

KEY DECISIONS FROM LAST SESSION:
${decisions.map((d: any, i: number) => `${i + 1}. ${d.title}: ${d.decision}`).join('\n') || 'None.'}

PENDING ACTIONS:
${actions.map((a: any, i: number) => `${i + 1}. [${a.priority}] ${a.description}`).join('\n') || 'None.'}

USER PREFERENCES & MEMORIES:
${preferences.map(m => `- ${m.content}`).join('\n') || 'None recorded.'}

RELEVANT CONTEXT:
${semanticContext.map((c: any) => `- ${c.content || c.summary || ''}`).join('\n') || 'None.'}

Your role is to help the user continue their work seamlessly. Reference the above context naturally.`;
  }
}
