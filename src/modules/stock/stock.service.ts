import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateStockDto, StockInDto, StockOutDto } from './stock.dto'
import { randomUUID } from 'crypto'

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateStockDto) {
    return this.prisma.stock.create({ data: dto })
  }

  async findAll(farmId: string) {
    const items = await this.prisma.stock.findMany({
      where: { farmId, deletedAt: null },
      include: {
        batches: { where: { remainingQty: { gt: 0 }, deletedAt: null }, orderBy: { date: 'asc' } },
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    })
    return items.map(item => {
      const currentQty = item.batches.reduce((s, b) => s + b.remainingQty, 0)
      const fifoCostPerUnit = item.batches.length > 0 ? item.batches[0].unitPrice : 0
      const totalValue = item.batches.reduce((s, b) => s + b.remainingQty * b.unitPrice, 0)
      const avgCostPerUnit = currentQty > 0 ? totalValue / currentQty : 0
      return { ...item, currentQty, fifoCostPerUnit, avgCostPerUnit, totalValue }
    })
  }

  getBatches(stockId: string) {
    return this.prisma.stockBatch.findMany({
      where: { stockId, deletedAt: null },
      orderBy: { date: 'desc' },
    })
  }

  getMovements(farmId: string, stockId?: string) {
    return this.prisma.stockOut.findMany({
      where: { farmId, deletedAt: null, ...(stockId ? { stockId } : {}) },
      include: {
        stock: { select: { name: true, unit: true } },
        pen: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async stockIn(dto: StockInDto) {
    const stock = await this.prisma.stock.findUnique({ where: { id: dto.stockId } })
    if (!stock) throw new NotFoundException('Stock item not found')
    const batch = await this.prisma.stockBatch.create({
      data: {
        id: randomUUID(),
        date: new Date(dto.date),
        qty: dto.qty,
        remainingQty: dto.qty,
        unitPrice: dto.unitPrice,
        totalCost: dto.qty * dto.unitPrice,
        supplier: dto.supplier,
        notes: dto.notes,
        stockId: dto.stockId,
        farmId: dto.farmId,
      },
    })
    return { batch, stock }
  }

  async stockOut(dto: StockOutDto) {
    const stock = await this.prisma.stock.findUnique({ where: { id: dto.stockId } })
    if (!stock) throw new NotFoundException('Stock item not found')
    const batches = await this.prisma.stockBatch.findMany({
      where: { stockId: dto.stockId, remainingQty: { gt: 0 }, deletedAt: null },
      orderBy: { date: 'asc' },
    })
    const totalAvailable = batches.reduce((s, b) => s + b.remainingQty, 0)
    if (totalAvailable < dto.qty)
      throw new BadRequestException(`Only ${totalAvailable.toFixed(2)} ${stock.unit} available in stock`)

    let remaining = dto.qty
    let totalCostUsed = 0
    for (const batch of batches) {
      if (remaining <= 0) break
      const deduct = Math.min(remaining, batch.remainingQty)
      totalCostUsed += deduct * batch.unitPrice
      remaining -= deduct
      await this.prisma.stockBatch.update({ where: { id: batch.id }, data: { remainingQty: { decrement: deduct } } })
    }

    return this.prisma.stockOut.create({
      data: {
        id: randomUUID(), date: new Date(dto.date), qty: dto.qty, costUsed: totalCostUsed,
        reason: dto.reason, stockId: dto.stockId, penId: dto.penId || null, farmId: dto.farmId,
      },
      include: {
        stock: { select: { name: true, unit: true } },
        pen: { select: { name: true } },
      },
    })
  }

  async remove(id: string) {
    const stock = await this.prisma.stock.findUnique({ where: { id } })
    if (!stock) throw new NotFoundException()
    return this.prisma.stock.update({ where: { id }, data: { deletedAt: new Date() } })
  }

  async getTotalFeedCost(farmId: string) {
    const outs = await this.prisma.stockOut.findMany({ where: { farmId, deletedAt: null } })
    return outs.reduce((s, r) => s + r.costUsed, 0)
  }
}
