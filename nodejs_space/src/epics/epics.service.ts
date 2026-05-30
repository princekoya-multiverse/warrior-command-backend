import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEpicDto } from './dto/create-epic.dto';
import { UpdateEpicDto } from './dto/update-epic.dto';

@Injectable()
export class EpicsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEpicDto) {
    return this.prisma.epic.create({
      data: {
        ...dto,
        target_completion: dto.target_completion ? new Date(dto.target_completion) : undefined,
      },
    });
  }

  async findAll(page = 1, limit = 20, projectId?: string, status?: string) {
    const where: any = {};
    if (projectId) where.project_id = projectId;
    if (status) where.status = status;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.epic.findMany({
        where, skip, take: limit,
        orderBy: { created_at: 'desc' },
        include: { _count: { select: { tasks: true, child_epics: true } } },
      }),
      this.prisma.epic.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const epic = await this.prisma.epic.findUnique({
      where: { id },
      include: { tasks: { take: 50 }, child_epics: true, _count: { select: { tasks: true } } },
    });
    if (!epic) throw new NotFoundException(`Epic ${id} not found`);
    return epic;
  }

  async update(id: string, dto: UpdateEpicDto) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.target_completion) data.target_completion = new Date(dto.target_completion);
    if (dto.status === 'completed') data.completed_at = new Date();
    if (dto.status === 'in_progress' && !data.started_at) data.started_at = new Date();
    return this.prisma.epic.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.epic.delete({ where: { id } });
  }
}
