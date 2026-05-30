import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getInfo() {
    return {
      name: 'Warrior Command Center API',
      version: '1.0.0',
      description: 'Institutional-grade Web3-native operations headquarters',
      status: 'operational',
      timestamp: new Date().toISOString(),
    };
  }

  async healthCheck() {
    let dbStatus = 'disconnected';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch {
      dbStatus = 'error';
    }

    return {
      status: dbStatus === 'connected' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        api: 'running',
      },
    };
  }
}
