import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateInventoryDto, UpdateInventoryDto, StockMovementDto } from './inventory.dto'
import { randomUUID } from 'crypto'

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateInventoryDto) {
    return this.prisma.inventory.create({ data: dto })
  }

  findAll(farmId: string) {
    return this.prisma.inventory.findMany({
      where: { farmId, deletedAt: null },
      orderBy: { item: 'asc' },
    })
  }

  async update(id: string, dto: UpdateInventoryDto) {
    const rec = await this.prisma.inventory.findUnique({ where: { id } })
    if (!rec) throw new NotFoundException()
    return this.prisma.inventory.update({ where: { id }, data: dto })
  }

  async remove(id: string) {
    const rec = await this.prisma.inventory.findUnique({ where: { id } })
    if (!rec) throw new NotFoundException()
    return this.prisma.inventory.update({ where: { id }, data: { deletedAt: new Date() } })
  }

  // Stock In — add quantity
  async stockIn(dto: StockMovementDto) {
    const item = await this.prisma.inventory.findUnique({ where: { id: dto.inventoryId } })
    if (!item) throw new NotFoundException('Inventory item not found')

    await this.prisma.stockMovement.create({
      data: {
        id: randomUUID(),
        date: new Date(dto.date),
        type: 'IN',
        qty: dto.qty,
        reason: dto.reason,
        inventoryId: dto.inventoryId,
        farmId: dto.farmId,
      },
    })

    return this.prisma.inventory.update({
      where: { id: dto.inventoryId },
      data: { qty: { increment: dto.qty } },
    })
  }

  // Stock Out — remove quantity
  async stockOut(dto: StockMovementDto) {
    const item = await this.prisma.inventory.findUnique({ where: { id: dto.inventoryId } })
    if (!item) throw new NotFoundException('Inventory item not found')
    if (item.qty < dto.qty) throw new BadRequestException(`Only ${item.qty} ${item.unit} available`)

    await this.prisma.stockMovement.create({
      data: {
        id: randomUUID(),
        date: new Date(dto.date),
        type: 'OUT',
        qty: dto.qty,
        reason: dto.reason,
        inventoryId: dto.inventoryId,
        farmId: dto.farmId,
      },
    })

    const updated = await this.prisma.inventory.update({
      where: { id: dto.inventoryId },
      data: { qty: { decrement: dto.qty } },
    })

    return updated
  }

  getMovements(farmId: string, inventoryId?: string) {
    return this.prisma.stockMovement.findMany({
      where: { farmId, ...(inventoryId ? { inventoryId } : {}) },
      include: { inventory: { select: { item: true, unit: true } } },
      orderBy: { date: 'desc' },
    })
  }

  getLowStock(farmId: string) {
    return this.prisma.inventory.findMany({
      where: { farmId },
    }).then(items => items.filter(i => i.qty <= i.minQty))
  }
}
