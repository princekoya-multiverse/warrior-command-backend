import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

export interface VectorPayload {
  userId?: string;
  sessionId?: string;
  projectId?: string;
  taskId?: string;
  memoryType?: string;
  scope?: string;
  content: string;
  summary?: string;
  importanceScore?: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

@Injectable()
export class QdrantService implements OnModuleInit {
  private readonly logger = new Logger(QdrantService.name);
  private baseUrl = '';
  private apiKey = '';
  private readonly collections = ['agent_memories', 'project_context', 'session_history'];
  private isAvailable = false;

  constructor(private readonly config: ConfigService) {}

  private headers(): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.apiKey) h['api-key'] = this.apiKey;
    return h;
  }

  private async qdrantFetch(path: string, options?: RequestInit): Promise<any> {
    const res = await fetch(`${this.baseUrl}${path}`, { ...options, headers: this.headers() });
    if (!res.ok && res.status !== 404) throw new Error(`Qdrant ${res.status}: ${await res.text()}`);
    return res.status === 404 ? null : res.json();
  }

  async onModuleInit() {
    const url = this.config.get<string>('QDRANT_URL');
    this.apiKey = this.config.get<string>('QDRANT_API_KEY') || '';
    if (!url) {
      this.logger.warn('QDRANT_URL not configured - vector store disabled');
      return;
    }
    this.baseUrl = url.replace(/\/$/, '');
    try {
      for (const collection of this.collections) {
        const exists = await this.qdrantFetch(`/collections/${collection}`);
        if (!exists) {
          await this.qdrantFetch(`/collections/${collection}`, {
            method: 'PUT',
            body: JSON.stringify({ vectors: { size: 768, distance: 'Cosine' } }),
          });
          this.logger.log(`Created Qdrant collection: ${collection}`);
        }
      }
      this.isAvailable = true;
      this.logger.log('Qdrant connected successfully');
    } catch (error) {
      this.logger.warn('Qdrant connection failed - vector store disabled');
    }
  }

  async upsert(collection: string, vector: number[], payload: VectorPayload): Promise<string> {
    const id = randomUUID();
    if (!this.isAvailable) return id;
    try {
      await this.qdrantFetch(`/collections/${collection}/points`, {
        method: 'PUT',
        body: JSON.stringify({ points: [{ id, vector, payload }] }),
      });
    } catch (error) {
      this.logger.error(`Qdrant upsert failed for ${collection}`, error);
    }
    return id;
  }

  async search(collection: string, vector: number[], filter?: Record<string, any>, limit = 10): Promise<any[]> {
    if (!this.isAvailable) return [];
    try {
      const body: any = { vector, limit, with_payload: true };
      if (filter) {
        body.filter = { must: Object.entries(filter).map(([key, value]) => ({ key, match: { value } })) };
      }
      const result = await this.qdrantFetch(`/collections/${collection}/points/search`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      return (result?.result || []).map((r: any) => ({ id: r.id, score: r.score, payload: r.payload }));
    } catch (error) {
      this.logger.error(`Qdrant search failed for ${collection}`, error);
      return [];
    }
  }

  async delete(collection: string, ids: string[]): Promise<void> {
    if (!this.isAvailable) return;
    try {
      await this.qdrantFetch(`/collections/${collection}/points/delete`, {
        method: 'POST',
        body: JSON.stringify({ points: ids }),
      });
    } catch (error) {
      this.logger.error(`Qdrant delete failed for ${collection}`, error);
    }
  }

  getAvailability(): boolean {
    return this.isAvailable;
  }
}
