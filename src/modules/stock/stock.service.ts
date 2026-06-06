import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateStockDto, StockInDto, StockOutDto } from './stock.dto'
import { randomUUID } from 'crypto'

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  // ── Create stock item ─────────────────────────────────────────
  create(dto: CreateStockDto) {
    return this.prisma.stock.create({ data: dto })
  }

  // ── Get all stock items with computed qty and FIFO cost ───────
  async findAll(farmId: string) {
    const items = await this.prisma.stock.findMany({
      where: { farmId },
      include: {
        batches: { where: { remainingQty: { gt: 0 } }, orderBy: { date: 'asc' } },
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    })

    return items.map(item => {
      const currentQty = item.batches.reduce((s, b) => s + b.remainingQty, 0)
      // FIFO cost = cost of oldest batch still in stock
      const fifoCostPerUnit = item.batches.length > 0 ? item.batches[0].unitPrice : 0
      // Weighted average for reference
      const totalValue = item.batches.reduce((s, b) => s + b.remainingQty * b.unitPrice, 0)
      const avgCostPerUnit = currentQty > 0 ? totalValue / currentQty : 0
      return {
        ...item,
        currentQty,
        fifoCostPerUnit,
        avgCostPerUnit,
        totalValue,
      }
    })
  }

  // ── Get batches for a stock item (price history) ──────────────
  getBatches(stockId: string) {
    return this.prisma.stockBatch.findMany({
      where: { stockId },
      orderBy: { date: 'desc' },
    })
  }

  // ── Get all stock outs (movement log) ────────────────────────
  getMovements(farmId: string, stockId?: string) {
    return this.prisma.stockOut.findMany({
      where: { farmId, ...(stockId ? { stockId } : {}) },
      include: {
        stock: { select: { name: true, unit: true } },
        pen: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  // ── Stock In — create a new batch ─────────────────────────────
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

  // ── Stock Out — FIFO consumption ──────────────────────────────
  async stockOut(dto: StockOutDto) {
    const stock = await this.prisma.stock.findUnique({ where: { id: dto.stockId } })
    if (!stock) throw new NotFoundException('Stock item not found')

    // Get batches oldest first (FIFO)
    const batches = await this.prisma.stockBatch.findMany({
      where: { stockId: dto.stockId, remainingQty: { gt: 0 } },
      orderBy: { date: 'asc' },
    })

    const totalAvailable = batches.reduce((s, b) => s + b.remainingQty, 0)
    if (totalAvailable < dto.qty) {
      throw new BadRequestException(
        `Only ${totalAvailable.toFixed(2)} ${stock.unit} available in stock`
      )
    }

    // Consume FIFO — deduct from oldest batches first, track cost
    let remaining = dto.qty
    let totalCostUsed = 0

    for (const batch of batches) {
      if (remaining <= 0) break
      const deduct = Math.min(remaining, batch.remainingQty)
      totalCostUsed += deduct * batch.unitPrice
      remaining -= deduct
      await this.prisma.stockBatch.update({
        where: { id: batch.id },
        data: { remainingQty: { decrement: deduct } },
      })
    }

    // Record the stock out
    const stockOut = await this.prisma.stockOut.create({
      data: {
        id: randomUUID(),
        date: new Date(dto.date),
        qty: dto.qty,
        costUsed: totalCostUsed,
        reason: dto.reason,
        stockId: dto.stockId,
        penId: dto.penId || null,
        farmId: dto.farmId,
      },
      include: {
        stock: { select: { name: true, unit: true } },
        pen: { select: { name: true } },
      },
    })

    return stockOut
  }

  // ── Delete stock item ─────────────────────────────────────────
  async remove(id: string) {
    const stock = await this.prisma.stock.findUnique({ where: { id } })
    if (!stock) throw new NotFoundException()
    return this.prisma.stock.delete({ where: { id } })
  }

  // ── Summary for pricing engine ────────────────────────────────
  async getTotalFeedCost(farmId: string) {
    const outs = await this.prisma.stockOut.findMany({
      where: { farmId },
    })
    return outs.reduce((s, r) => s + r.costUsed, 0)
  }
}
