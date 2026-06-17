import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateFeedDto } from './feed.dto'

@Injectable()
export class FeedService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateFeedDto) {
    return this.prisma.feed.create({ data: { ...dto, date: new Date(dto.date) } })
  }

  findAll(farmId: string) {
    return this.prisma.feed.findMany({ where: { farmId, deletedAt: null }, orderBy: { date: 'desc' } })
  }

  async remove(id: string) {
    const rec = await this.prisma.feed.findUnique({ where: { id } })
    if (!rec) throw new NotFoundException()
    return this.prisma.feed.update({ where: { id }, data: { deletedAt: new Date() } })
  }
}
