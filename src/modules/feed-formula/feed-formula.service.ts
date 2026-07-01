import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  CreateFormulaDto,
  ProduceBatchDto,
  RecordUsageDto,
} from "./feed-formula.dto";
import { randomUUID } from "crypto";

@Injectable()
export class FeedFormulaService {
  constructor(private prisma: PrismaService) {}

  // ── Formulas ─────────────────────────────────────────────────

  async createFormula(dto: CreateFormulaDto) {
    return this.prisma.feedFormula.create({
      data: {
        id: randomUUID(),
        name: dto.name,
        description: dto.description,
        unit: dto.unit ?? "bags",
        farmId: dto.farmId,
        ingredients: {
          create: dto.ingredients.map((i) => ({
            id: randomUUID(),
            stockId: i.stockId,
          })),
        },
      },
      include: {
        ingredients: {
          include: { stock: { select: { name: true, unit: true } } },
        },
      },
    });
  }

  findAllFormulas(farmId: string) {
    return this.prisma.feedFormula.findMany({
      where: { farmId, deletedAt: null },
      include: {
        ingredients: {
          include: { stock: { select: { id: true, name: true, unit: true } } },
        },
        _count: { select: { batches: true } },
      },
      orderBy: { name: "asc" },
    });
  }

  async deleteFormula(id: string) {
    const f = await this.prisma.feedFormula.findUnique({ where: { id } });
    if (!f) throw new NotFoundException();
    return this.prisma.feedFormula.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // ── Batches ───────────────────────────────────────────────────

  async produceBatch(dto: ProduceBatchDto) {
    const formula = await this.prisma.feedFormula.findUnique({
      where: { id: dto.formulaId },
      include: { ingredients: { include: { stock: true } } },
    });
    if (!formula) throw new NotFoundException("Formula not found");

    // Validate all ingredients are in the formula
    const formulaStockIds = new Set(formula.ingredients.map((i) => i.stockId));
    for (const ing of dto.ingredients) {
      if (!formulaStockIds.has(ing.stockId)) {
        throw new BadRequestException(`Stock item not part of this formula`);
      }
    }

    // Check stock availability and deduct FIFO for each ingredient
    const batchIngredientData: {
      stockId: string;
      qty: number;
      costUsed: number;
    }[] = [];

    for (const ing of dto.ingredients) {
      const stock = formula.ingredients.find(
        (i) => i.stockId === ing.stockId,
      )!.stock;
      const batches = await this.prisma.stockBatch.findMany({
        where: { stockId: ing.stockId, remainingQty: { gt: 0 } },
        orderBy: { date: "asc" },
      });
      const available = batches.reduce((s, b) => s + b.remainingQty, 0);
      if (available < ing.qty) {
        throw new BadRequestException(
          `Not enough ${stock.name}: need ${ing.qty} ${stock.unit}, only ${available.toFixed(2)} available`,
        );
      }

      // FIFO deduction
      let remaining = ing.qty;
      let totalCostUsed = 0;
      for (const batch of batches) {
        if (remaining <= 0) break;
        const deduct = Math.min(remaining, batch.remainingQty);
        totalCostUsed += deduct * batch.unitPrice;
        remaining -= deduct;
        await this.prisma.stockBatch.update({
          where: { id: batch.id },
          data: { remainingQty: { decrement: deduct } },
        });
      }

      // Record stock out
      await this.prisma.stockOut.create({
        data: {
          id: randomUUID(),
          date: new Date(dto.date),
          qty: ing.qty,
          costUsed: totalCostUsed,
          reason: `Feed production — ${formula.name} batch ${dto.batchNo}`,
          stockId: ing.stockId,
          farmId: dto.farmId,
        },
      });

      batchIngredientData.push({
        stockId: ing.stockId,
        qty: ing.qty,
        costUsed: totalCostUsed,
      });
    }

    // Create the feed batch with ingredient breakdown
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
        ingredients: {
          create: batchIngredientData.map((i) => ({
            id: randomUUID(),
            stockId: i.stockId,
            qty: i.qty,
            costUsed: i.costUsed,
          })),
        },
      },
      include: {
        formula: { select: { name: true, unit: true } },
        ingredients: {
          include: { stock: { select: { name: true, unit: true } } },
        },
      },
    });
  }

  findAllBatches(farmId: string) {
    return this.prisma.feedBatch.findMany({
      where: { farmId, deletedAt: null },
      include: {
        formula: { select: { name: true, unit: true } },
        ingredients: {
          include: { stock: { select: { name: true, unit: true } } },
        },
        _count: { select: { usages: true } },
      },
      orderBy: { date: "desc" },
    });
  }

  async deleteBatch(id: string) {
    const batch = await this.prisma.feedBatch.findUnique({
      where: { id },
      include: { ingredients: true },
    });
    if (!batch) throw new NotFoundException("Batch not found");

    for (const ing of batch.ingredients) {
      // 1. Soft-delete the StockOut record created for this ingredient during production
      //    Match exactly by stockId AND reason containing batchNo with word boundary check
      await this.prisma.stockOut.updateMany({
        where: {
          stockId: ing.stockId,
          reason: { contains: `batch ${batch.batchNo}` },
          deletedAt: null,
        },
        data: { deletedAt: new Date() },
      });

      // 2. Restore stock using correct FIFO rewind:
      //    Replay from the oldest batch — restore qty to batches that were depleted, newest first
      let toRestore = ing.qty;
      const stockBatches = await this.prisma.stockBatch.findMany({
        where: { stockId: ing.stockId, deletedAt: null },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }], // newest first for restoration
      });
      for (const sb of stockBatches) {
        if (toRestore <= 0) break;
        const canRestore = Math.min(toRestore, sb.qty - sb.remainingQty); // only restore up to what was consumed
        if (canRestore <= 0) continue;
        await this.prisma.stockBatch.update({
          where: { id: sb.id },
          data: { remainingQty: { increment: canRestore } },
        });
        toRestore -= canRestore;
      }
    }

    return this.prisma.feedBatch.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // ── Usage ─────────────────────────────────────────────────────

  async recordUsage(dto: RecordUsageDto) {
    const batch = await this.prisma.feedBatch.findUnique({
      where: { id: dto.batchId },
    });
    if (!batch) throw new NotFoundException("Batch not found");
    if (batch.qtyRemaining < dto.qty) {
      throw new BadRequestException(
        `Only ${batch.qtyRemaining} remaining in this batch`,
      );
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
    });

    await this.prisma.feedBatch.update({
      where: { id: dto.batchId },
      data: { qtyRemaining: { decrement: dto.qty } },
    });

    return usage;
  }

  findAllUsages(farmId: string, batchId?: string) {
    return this.prisma.feedUsage.findMany({
      where: { farmId, deletedAt: null, ...(batchId ? { batchId } : {}) },
      include: {
        batch: { include: { formula: { select: { name: true, unit: true } } } },
        pen: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async deleteUsage(id: string) {
    const usage = await this.prisma.feedUsage.findUnique({ where: { id } });
    if (!usage) throw new NotFoundException("Usage not found");
    await this.prisma.feedBatch.update({
      where: { id: usage.batchId },
      data: { qtyRemaining: { increment: usage.qty } },
    });
    return this.prisma.feedUsage.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
