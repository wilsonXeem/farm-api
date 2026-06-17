import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateSaleDto, UpdateSaleStatusDto } from './sales.dto'

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateSaleDto) {
    return this.prisma.sale.create({ data: { ...dto, date: new Date(dto.date) } })
  }

  findAll(farmId: string) {
    return this.prisma.sale.findMany({ where: { farmId, deletedAt: null }, orderBy: { date: 'desc' } })
  }

  async updateStatus(id: string, dto: UpdateSaleStatusDto) {
    const rec = await this.prisma.sale.findUnique({ where: { id } })
    if (!rec) throw new NotFoundException()
    return this.prisma.sale.update({ where: { id }, data: { status: dto.status } })
  }

  async remove(id: string) {
    const rec = await this.prisma.sale.findUnique({ where: { id } })
    if (!rec) throw new NotFoundException()
    return this.prisma.sale.update({ where: { id }, data: { deletedAt: new Date() } })
  }
}
