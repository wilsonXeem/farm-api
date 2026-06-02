import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreatePenDto, UpdatePenDto } from './pens.dto'

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
      where: { farmId },
      include: {
        worker: { select: { id: true, name: true, role: true } },
        _count: { select: { production: true, mortality: true } },
      },
      orderBy: { name: 'asc' },
    })
  }

  findByWorker(workerId: string) {
    return this.prisma.pen.findMany({
      where: { workerId },
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
    return this.prisma.pen.delete({ where: { id } })
  }
}
