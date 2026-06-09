import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateFormulaDto, ProduceBatchDto, RecordUsageDto } from './feed-formula.dto'
import { randomUUID } from 'crypto'

@Injectable()
export class FeedFormulaService {
  constructor(private prisma: PrismaService) {}

  // ── Formulas ─────────────────────────────────────────────────

  async createFormula(dto: CreateFormulaDto) {
    const formula = await this.prisma.feedFormula.create({
      data: {
        id: randomUUID(),
        name: dto.name,
        description: dto.description,
        unit: dto.unit ?? 'bags',
        farmId: dto.farmId,
        ingredients: {
          create: dto.ingredients.map(i => ({
            id: randomUUID(),
            stockId: i.stockId,
            qtyPerUnit: i.qtyPerUnit,
          })),
        },
      },
      include: {
        ingredients: { include: { stock: { select: { name: true, unit: true } } } },
      },
    })
    return formula
  }

  findAllFormulas(farmId: string) {
    return this.prisma.feedFormula.findMany({
      where: { farmId },
      include: {
        ingredients: { include: { stock: { select: { id: true, name: true, unit: true } } } },
        _count: { select: { batches: true } },
      },
      orderBy: { name: 'asc' },
    })
  }

  async deleteFormula(id: string) {
    const f = await this.prisma.feedFormula.findUnique({ where: { id } })
    if (!f) throw new NotFoundException()
    return this.prisma.feedFormula.delete({ where: { id } })
  }

  // ── Batches ───────────────────────────────────────────────────

  async produceBatch(dto: ProduceBatchDto) {
    const formula = await this.prisma.feedFormula.findUnique({
      where: { id: dto.formulaId },
      include: { ingredients: { include: { stock: true } } },
    })
    if (!formula) throw new NotFoundException('Formula not found')

    // Check all ingredients have enough stock (FIFO)
    for (const ing of formula.ingredients) {
      const batches = await this.prisma.stockBatch.findMany({
        where: { stockId: ing.stockId, remainingQty: { gt: 0 } },
      })
      const available = batches.reduce((s, b) => s + b.remainingQty, 0)
      const needed = ing.qtyPerUnit * dto.qtyProduced
      if (available < needed) {
        throw new BadRequestException(
          `Not enough ${ing.stock.name}: need ${needed} ${ing.stock.unit}, only ${available.toFixed(2)} available`
        )
      }
    }

    // Deduct ingredients from stock (FIFO) for each ingredient
    for (const ing of formula.ingredients) {
      let remaining = ing.qtyPerUnit * dto.qtyProduced
      let totalCostUsed = 0
      const batches = await this.prisma.stockBatch.findMany({
        where: { stockId: ing.stockId, remainingQty: { gt: 0 } },
        orderBy: { date: 'asc' },
      })
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
      // Record stock out
      await this.prisma.stockOut.create({
        data: {
          id: randomUUID(),
          date: new Date(dto.date),
          qty: ing.qtyPerUnit * dto.qtyProduced,
          costUsed: totalCostUsed,
          reason: `Feed production — ${formula.name} batch ${dto.batchNo}`,
          stockId: ing.stockId,
          farmId: dto.farmId,
        },
      })
    }

    // Create the feed batch
    return this.prisma.feedBatch.create({
      data: {
        id: randomUUID(),
        date: new Date(dto.date),
        batchNo: dto.batchNo,
        formulaId: dto.formulaId,
        qtyProduced: dto.qtyProduced,
        qtyRemaining: dto.qtyProduced,
        notes: dto.notes,
        farmId: dto.farmId,
      },
      include: { formula: { select: { name: true, unit: true } } },
    })
  }

  findAllBatches(farmId: string) {
    return this.prisma.feedBatch.findMany({
      where: { farmId },
      include: {
        formula: { select: { name: true, unit: true } },
        _count: { select: { usages: true } },
      },
      orderBy: { date: 'desc' },
    })
  }

  // ── Usage ─────────────────────────────────────────────────────

  async recordUsage(dto: RecordUsageDto) {
    const batch = await this.prisma.feedBatch.findUnique({ where: { id: dto.batchId } })
    if (!batch) throw new NotFoundException('Batch not found')
    if (batch.qtyRemaining < dto.qty) {
      throw new BadRequestException(
        `Only ${batch.qtyRemaining} remaining in this batch`
      )
    }

    const usage = await this.prisma.feedUsage.create({
      data: {
        id: randomUUID(),
        date: new Date(dto.date),
        batchId: dto.batchId,
        penId: dto.penId || null,
        qty: dto.qty,
        notes: dto.notes,
        farmId: dto.farmId,
      },
      include: {
        batch: { include: { formula: { select: { name: true, unit: true } } } },
        pen: { select: { name: true } },
      },
    })

    await this.prisma.feedBatch.update({
      where: { id: dto.batchId },
      data: { qtyRemaining: { decrement: dto.qty } },
    })

    return usage
  }

  findAllUsages(farmId: string, batchId?: string) {
    return this.prisma.feedUsage.findMany({
      where: { farmId, ...(batchId ? { batchId } : {}) },
      include: {
        batch: { include: { formula: { select: { name: true, unit: true } } } },
        pen: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }
}
