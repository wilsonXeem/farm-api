import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateOtherSaleDto } from './other-sales.dto'

@Injectable()
export class OtherSalesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateOtherSaleDto) {
    if (dto.item === 'Hens' && dto.penId) {
      const pen = await this.prisma.pen.findUnique({ where: { id: dto.penId } })
      if (!pen) throw new NotFoundException('Pen not found')
      const newCount = pen.totalBirds - Math.floor(dto.qty)
      if (newCount < 0) throw new BadRequestException(`Only ${pen.totalBirds} birds available in ${pen.name}`)
      await this.prisma.pen.update({ where: { id: dto.penId }, data: { totalBirds: newCount } })
    }
    return this.prisma.otherSale.create({
      data: { ...dto, date: new Date(dto.date) },
      include: { pen: { select: { id: true, name: true } } },
    })
  }

  findAll(farmId: string) {
    return this.prisma.otherSale.findMany({
      where: { farmId },
      include: { pen: { select: { id: true, name: true } } },
      orderBy: { date: 'desc' },
    })
  }

  async remove(id: string) {
    const rec = await this.prisma.otherSale.findUnique({ where: { id } })
    if (!rec) throw new NotFoundException()
    // Restore bird count if reversing a hen sale
    if (rec.item === 'Hens' && rec.penId) {
      await this.prisma.pen.update({
        where: { id: rec.penId },
        data: { totalBirds: { increment: Math.floor(rec.qty) } },
      })
    }
    return this.prisma.otherSale.delete({ where: { id } })
  }
}
