import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreatePenDto, UpdatePenDto, AddBirdsDto } from './pens.dto'

@Injectable()
export class PensService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreatePenDto) {
    return this.prisma.pen.create({
      data: dto,
      include: { worker: { select: { id: true, name: true, role: true } } },
    })
  }

  findAll(farmId: string) {
    return this.prisma.pen.findMany({
      where: { farmId, deletedAt: null },
      include: {
        worker: { select: { id: true, name: true, role: true } },
        _count: { select: { production: true, mortality: true } },
      },
      orderBy: { name: 'asc' },
    })
  }

  findByWorker(workerId: string) {
    return this.prisma.pen.findMany({
      where: { workerId, deletedAt: null },
      include: { worker: { select: { id: true, name: true, role: true } } },
    })
  }

  async update(id: string, dto: UpdatePenDto) {
    const pen = await this.prisma.pen.findUnique({ where: { id } })
    if (!pen) throw new NotFoundException('Pen not found')
    return this.prisma.pen.update({
      where: { id },
      data: dto,
      include: { worker: { select: { id: true, name: true, role: true } } },
    })
  }

  async remove(id: string) {
    const pen = await this.prisma.pen.findUnique({ where: { id } })
    if (!pen) throw new NotFoundException('Pen not found')
    return this.prisma.pen.update({ where: { id }, data: { deletedAt: new Date() } })
  }

  // ── Bird entries ──────────────────────────────────────────────
  async addBirds(penId: string, dto: AddBirdsDto) {
    const pen = await this.prisma.pen.findUnique({ where: { id: penId } })
    if (!pen) throw new NotFoundException('Pen not found')
    const [entry] = await this.prisma.$transaction([
      this.prisma.birdEntry.create({
        data: { date: new Date(dto.date), count: dto.count, notes: dto.notes, penId, farmId: dto.farmId },
      }),
      this.prisma.pen.update({
        where: { id: penId },
        data: { totalBirds: { increment: dto.count } },
      }),
    ])
    return entry
  }

  getBirdEntries(penId: string) {
    return this.prisma.birdEntry.findMany({
      where: { penId, deletedAt: null },
      orderBy: { date: 'desc' },
    })
  }

  getAllBirdEntries(farmId: string) {
    return this.prisma.birdEntry.findMany({
      where: { farmId, deletedAt: null },
      include: { pen: { select: { name: true } } },
      orderBy: { date: 'desc' },
    })
  }
}
