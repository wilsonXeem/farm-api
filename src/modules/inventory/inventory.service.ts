import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateInventoryDto, UpdateInventoryDto } from './inventory.dto'

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateInventoryDto) { return this.prisma.inventory.create({ data: dto }) }

  findAll(farmId: string) {
    return this.prisma.inventory.findMany({ where: { farmId }, orderBy: { item: 'asc' } })
  }

  async update(id: string, dto: UpdateInventoryDto) {
    const rec = await this.prisma.inventory.findUnique({ where: { id } })
    if (!rec) throw new NotFoundException()
    return this.prisma.inventory.update({ where: { id }, data: dto })
  }

  async remove(id: string) {
    const rec = await this.prisma.inventory.findUnique({ where: { id } })
    if (!rec) throw new NotFoundException()
    return this.prisma.inventory.delete({ where: { id } })
  }
}
