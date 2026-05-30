import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({ origin: '*' });

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Swagger documentation
  const swaggerPath = 'api-docs';

  // Cache-busting headers for Swagger
  app.use(`/${swaggerPath}`, (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    next();
  });

  const config = new DocumentBuilder()
    .setTitle('Warrior Command Center')
    .setDescription(
      'Institutional-grade Web3-native operations headquarters API. ' +
      'Manage projects, tasks, AI agents, sessions with persistent memory, and real-time communication.',
    )
    .setVersion('1.0.0')
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'api-key')
    .addTag('System', 'Health checks and service info')
    .addTag('Users', 'User management')
    .addTag('Projects', 'Project management')
    .addTag('Epics', 'Epic management within projects')
    .addTag('Tasks', 'Task and subtask management')
    .addTag('Daily Logs', 'Daily activity logging')
    .addTag('Agents', 'AI agent registration and management')
    .addTag('Sessions', 'Conversation sessions with handoff protocol')
    .addTag('Memory', 'Persistent agent memory and semantic search')
    .addTag('LiveKit', 'Real-time communication integration')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(swaggerPath, app, document, {
    customSiteTitle: 'Warrior Command Center',
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info { margin: 30px 0; }
      .swagger-ui .info .title { font-size: 2em; color: #1a1a2e; }
      .swagger-ui .info .description p { font-size: 1.1em; color: #4a4a6a; }
      .swagger-ui .opblock-tag { font-size: 1.1em; border-bottom: 2px solid #e0e0e0; }
      .swagger-ui .opblock.opblock-post { border-color: #49cc90; background: rgba(73, 204, 144, 0.05); }
      .swagger-ui .opblock.opblock-get { border-color: #61affe; background: rgba(97, 175, 254, 0.05); }
      .swagger-ui .opblock.opblock-put { border-color: #fca130; background: rgba(252, 161, 48, 0.05); }
      .swagger-ui .opblock.opblock-delete { border-color: #f93e3e; background: rgba(249, 62, 62, 0.05); }
      body { background: #fafbfc; }
    `,
    customfavIcon: 'https://cdn-icons-png.flaticon.com/512/2721/2721295.png',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Warrior Command Center running on port ${port}`);
  logger.log(`API docs: http://localhost:${port}/${swaggerPath}`);
}

bootstrap();
