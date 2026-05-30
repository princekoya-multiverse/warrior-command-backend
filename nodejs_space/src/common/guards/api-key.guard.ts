import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyGuard.name);

  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }
    const users = await this.prisma.user.findMany({ where: { api_key_hash: { not: null } } });
    for (const user of users) {
      if (user.api_key_hash && await bcrypt.compare(apiKey, user.api_key_hash)) {
        request.user = user;
        return true;
      }
    }
    throw new UnauthorizedException('Invalid API key');
  }
}
