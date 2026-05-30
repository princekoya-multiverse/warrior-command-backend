import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://apps.abacus.ai/v1/chat/completions';

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get<string>('ABACUSAI_API_KEY') || '';
  }

  async generateSummary(messages: { role: string; content: string }[]): Promise<{
    executiveSummary: string;
    decisions: { title: string; decision: string; importance: number }[];
    actions: { description: string; priority: string }[];
    projectContext: Record<string, any>;
  }> {
    const transcript = messages.map(m => `${m.role}: ${m.content}`).join('\n');
    const prompt = `Analyze this conversation transcript and produce a structured summary in JSON format.

Transcript:
${transcript}

Please respond in JSON format with the following structure:
{
  "executiveSummary": "2-3 sentence summary",
  "decisions": [{"title": "string", "decision": "string", "importance": 0.8}],
  "actions": [{"description": "string", "priority": "high|medium|low"}],
  "projectContext": {}
}
Respond with raw JSON only.`;

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          stream: false,
        }),
      });
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '{}';
      return JSON.parse(content);
    } catch (error) {
      this.logger.error('Failed to generate summary', error);
      return {
        executiveSummary: 'Summary generation failed.',
        decisions: [],
        actions: [],
        projectContext: {},
      };
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    // Use a simple hash-based embedding as placeholder
    // In production, integrate with Abacus AI embedding endpoint
    const embedding = new Array(768).fill(0);
    for (let i = 0; i < text.length && i < 768; i++) {
      embedding[i % 768] = (text.charCodeAt(i) / 255) * 2 - 1;
    }
    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
    if (magnitude > 0) {
      for (let i = 0; i < embedding.length; i++) {
        embedding[i] /= magnitude;
      }
    }
    return embedding;
  }
}
