import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        ...dto,
        due_date: dto.due_date ? new Date(dto.due_date) : undefined,
      },
    });
  }

  async findAll(page = 1, limit = 20, filters: {
    status?: string; projectId?: string; epicId?: string;
    assignedTo?: string; assignedAgent?: string; parentTaskId?: string;
  } = {}) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.projectId) where.project_id = filters.projectId;
    if (filters.epicId) where.epic_id = filters.epicId;
    if (filters.assignedTo) where.assigned_to = filters.assignedTo;
    if (filters.assignedAgent) where.assigned_agent = filters.assignedAgent;
    if (filters.parentTaskId) where.parent_task_id = filters.parentTaskId;
    // Top-level tasks only by default (unless parent is specified)
    if (!filters.parentTaskId && filters.parentTaskId !== '') {
      where.parent_task_id = null;
    }
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.task.findMany({
        where, skip, take: limit,
        orderBy: [{ priority: 'desc' }, { created_at: 'desc' }],
        include: { _count: { select: { subtasks: true } }, assignee: { select: { id: true, username: true, display_name: true } } },
      }),
      this.prisma.task.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        subtasks: true,
        assignee: { select: { id: true, username: true, display_name: true } },
        epic: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
    });
    if (!task) throw new NotFoundException(`Task ${id} not found`);
    return task;
  }

  async update(id: string, dto: UpdateTaskDto) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.due_date) data.due_date = new Date(dto.due_date);
    if (dto.status === 'completed') data.completed_at = new Date();
    if (dto.status === 'in_progress' && !data.started_at) data.started_at = new Date();
    return this.prisma.task.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.task.delete({ where: { id } });
  }

  async getSubtasks(id: string) {
    await this.findOne(id);
    return this.prisma.task.findMany({
      where: { parent_task_id: id },
      orderBy: [{ priority: 'desc' }, { created_at: 'desc' }],
    });
  }

  async getTodayTasks(userId?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const where: any = {
      OR: [
        { due_date: { gte: today, lt: tomorrow } },
        { status: { in: ['in_progress', 'blocked'] } },
      ],
    };
    if (userId) where.assigned_to = userId;
    return this.prisma.task.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { due_date: 'asc' }],
      include: { project: { select: { id: true, name: true } } },
    });
  }

  async getWeekTasks(userId?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const where: any = {
      OR: [
        { due_date: { gte: today, lt: weekEnd } },
        { status: { in: ['in_progress', 'blocked'] } },
      ],
    };
    if (userId) where.assigned_to = userId;
    return this.prisma.task.findMany({
      where,
      orderBy: [{ due_date: 'asc' }, { priority: 'desc' }],
      include: { project: { select: { id: true, name: true } } },
    });
  }
}
