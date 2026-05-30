import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';

@Injectable()
export class AgentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAgentDto) {
    try {
      return await this.prisma.agent.create({ data: dto });
    } catch (error: any) {
      if (error.code === 'P2002') throw new ConflictException('Agent identifier already exists');
      throw error;
    }
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.agent.findMany({ skip, take: limit, orderBy: { created_at: 'desc' } }),
      this.prisma.agent.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const agent = await this.prisma.agent.findUnique({ where: { id } });
    if (!agent) throw new NotFoundException(`Agent ${id} not found`);
    return agent;
  }

  async findByIdentifier(identifier: string) {
    const agent = await this.prisma.agent.findUnique({ where: { identifier } });
    if (!agent) throw new NotFoundException(`Agent ${identifier} not found`);
    return agent;
  }

  async update(id: string, dto: UpdateAgentDto) {
    await this.findOne(id);
    return this.prisma.agent.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.agent.delete({ where: { id } });
  }
}
