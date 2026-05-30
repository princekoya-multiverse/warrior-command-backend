import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDailyLogDto } from './dto/create-daily-log.dto';
import { UpdateDailyLogDto } from './dto/update-daily-log.dto';

@Injectable()
export class DailyLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDailyLogDto) {
    try {
      return await this.prisma.daily_log.create({
        data: {
          ...dto,
          log_date: new Date(dto.log_date),
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') throw new ConflictException('A daily log already exists for this user and date');
      throw error;
    }
  }

  async findAll(page = 1, limit = 20, userId?: string, projectId?: string) {
    const where: any = {};
    if (userId) where.user_id = userId;
    if (projectId) where.project_id = projectId;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.daily_log.findMany({
        where, skip, take: limit,
        orderBy: { log_date: 'desc' },
      }),
      this.prisma.daily_log.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const log = await this.prisma.daily_log.findUnique({ where: { id } });
    if (!log) throw new NotFoundException(`Daily log ${id} not found`);
    return log;
  }

  async update(id: string, dto: UpdateDailyLogDto) {
    await this.findOne(id);
    return this.prisma.daily_log.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.daily_log.delete({ where: { id } });
  }
}
