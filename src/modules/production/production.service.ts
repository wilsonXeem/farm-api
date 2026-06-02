import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateProductionDto } from './production.dto'

@Injectable()
export class ProductionService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateProductionDto) {
    const cracked = dto.crackedEggs ?? 0
    const spoilt = dto.spoiltEggs ?? 0
    return this.prisma.production.create({
      data: {
        date: new Date(dto.date),
        totalEggs: dto.totalEggs,
        crackedEggs: cracked,
        spoiltEggs: spoilt,
        goodEggs: dto.totalEggs - cracked - spoilt,
        notes: dto.notes,
        farmId: dto.farmId,
        penId: dto.penId,
      },
      include: { pen: { select: { id: true, name: true } } },
    })
  }

  async findAll(farmId: string, penId?: string, workerId?: string) {
    // If workerId provided (staff role), scope to their pens only
    let penIds: string[] | undefined
    if (workerId) {
      const pens = await this.prisma.pen.findMany({ where: { workerId }, select: { id: true } })
      penIds = pens.map(p => p.id)
    }

    return this.prisma.production.findMany({
      where: {
        farmId,
        ...(penId ? { penId } : {}),
        ...(penIds ? { penId: { in: penIds } } : {}),
      },
      include: { pen: { select: { id: true, name: true } } },
      orderBy: { date: 'desc' },
    })
  }

  async remove(id: string) {
    const rec = await this.prisma.production.findUnique({ where: { id } })
    if (!rec) throw new NotFoundException()
    return this.prisma.production.delete({ where: { id } })
  }
}
