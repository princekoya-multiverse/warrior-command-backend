import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        ...dto,
        started_at: dto.started_at ? new Date(dto.started_at) : undefined,
        target_completion: dto.target_completion ? new Date(dto.target_completion) : undefined,
      },
    });
  }

  async findAll(page = 1, limit = 20, status?: string, ownerId?: string) {
    const where: any = {};
    if (status) where.status = status;
    if (ownerId) where.owner_id = ownerId;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.project.findMany({
        where, skip, take: limit,
        orderBy: { created_at: 'desc' },
        include: { _count: { select: { epics: true, tasks: true } } },
      }),
      this.prisma.project.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { owner: { select: { id: true, username: true, display_name: true } }, _count: { select: { epics: true, tasks: true } } },
    });
    if (!project) throw new NotFoundException(`Project ${id} not found`);
    return project;
  }

  async update(id: string, dto: UpdateProjectDto) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.started_at) data.started_at = new Date(dto.started_at);
    if (dto.target_completion) data.target_completion = new Date(dto.target_completion);
    if (dto.status === 'completed') data.completed_at = new Date();
    if (dto.status === 'archived') data.archived_at = new Date();
    return this.prisma.project.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.project.delete({ where: { id } });
  }
}
