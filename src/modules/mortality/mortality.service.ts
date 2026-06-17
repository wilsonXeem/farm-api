import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateMortalityDto } from './mortality.dto'

@Injectable()
export class MortalityService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateMortalityDto) {
    return this.prisma.mortality.create({
      data: { ...dto, date: new Date(dto.date) },
      include: { pen: { select: { id: true, name: true } } },
    })
  }

  async findAll(farmId: string, penId?: string, workerId?: string) {
    let penIds: string[] | undefined
    if (workerId) {
      const pens = await this.prisma.pen.findMany({ where: { workerId }, select: { id: true } })
      penIds = pens.map(p => p.id)
    }
    return this.prisma.mortality.findMany({
      where: {
        farmId,
        deletedAt: null,
        ...(penId ? { penId } : {}),
        ...(penIds ? { penId: { in: penIds } } : {}),
      },
      include: { pen: { select: { id: true, name: true } } },
      orderBy: { date: 'desc' },
    })
  }

  async remove(id: string) {
    const rec = await this.prisma.mortality.findUnique({ where: { id } })
    if (!rec) throw new NotFoundException()
    return this.prisma.mortality.update({ where: { id }, data: { deletedAt: new Date() } })
  }
}
