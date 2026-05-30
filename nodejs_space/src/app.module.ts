import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { EpicsModule } from './epics/epics.module';
import { TasksModule } from './tasks/tasks.module';
import { DailyLogsModule } from './daily-logs/daily-logs.module';
import { AgentsModule } from './agents/agents.module';
import { SessionsModule } from './sessions/sessions.module';
import { MemoryModule } from './memory/memory.module';
import { GatewayModule } from './gateway/gateway.module';
import { LivekitModule } from './livekit/livekit.module';
import { LlmModule } from './llm/llm.module';
import { QdrantModule } from './qdrant/qdrant.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    ProjectsModule,
    EpicsModule,
    TasksModule,
    DailyLogsModule,
    AgentsModule,
    SessionsModule,
    MemoryModule,
    GatewayModule,
    LivekitModule,
    LlmModule,
    QdrantModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
