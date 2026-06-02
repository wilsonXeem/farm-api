import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateSaleDto } from './sales.dto'

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateSaleDto) {
    return this.prisma.sale.create({ data: { ...dto, date: new Date(dto.date) } })
  }

  findAll(farmId: string) {
    return this.prisma.sale.findMany({ where: { farmId }, orderBy: { date: 'desc' } })
  }

  async remove(id: string) {
    const rec = await this.prisma.sale.findUnique({ where: { id } })
    if (!rec) throw new NotFoundException()
    return this.prisma.sale.delete({ where: { id } })
  }
}
