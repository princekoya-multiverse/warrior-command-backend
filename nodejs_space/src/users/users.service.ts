import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    try {
      return await this.prisma.user.create({ data: dto });
    } catch (error: any) {
      if (error.code === 'P2002') throw new ConflictException('Username or wallet address already exists');
      throw error;
    }
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({ skip, take: limit, orderBy: { created_at: 'desc' } }),
      this.prisma.user.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);
    return this.prisma.user.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.user.delete({ where: { id } });
  }

  async generateApiKey(id: string): Promise<{ apiKey: string }> {
    await this.findOne(id);
    const apiKey = `wcc_${randomUUID().replace(/-/g, '')}`;
    const hash = await bcrypt.hash(apiKey, 10);
    await this.prisma.user.update({ where: { id }, data: { api_key_hash: hash } });
    return { apiKey };
  }
}
