import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class PricingService {
  constructor(private prisma: PrismaService) {}

  async calculate(farmId: string, marginPct = 25) {
    const [production, feed, expenses, sales, workers] = await Promise.all([
      this.prisma.production.findMany({ where: { farmId } }),
      this.prisma.feed.findMany({ where: { farmId } }),
      this.prisma.expense.findMany({ where: { farmId } }),
      this.prisma.sale.findMany({ where: { farmId } }),
      this.prisma.worker.findMany({ where: { farmId } }),
    ])

    const goodEggs = production.reduce((s, r) => s + r.goodEggs, 0)
    const feedCost = feed.reduce((s, r) => s + r.totalCost, 0)
    const salaryCost = workers.reduce((s, w) => s + w.salary, 0)
    const otherCost = expenses.reduce((s, r) => s + r.amount, 0)
    const totalExpenses = feedCost + salaryCost + otherCost
    const totalRevenue = sales.reduce((s, r) => s + r.total, 0)
    const profit = totalRevenue - totalExpenses
    const costPerEgg = goodEggs > 0 ? totalExpenses / goodEggs : 0
    const costPerCrate = costPerEgg * 30
    const suggestedPerEgg = costPerEgg * (1 + marginPct / 100)
    const suggestedPerCrate = suggestedPerEgg * 30

    const totalEggsSold = sales.reduce((s, r) => s + r.crates * 30, 0)
    const avgActualPerEgg = totalEggsSold > 0 ? totalRevenue / totalEggsSold : 0
    const isSellingAtLoss = avgActualPerEgg > 0 && avgActualPerEgg < costPerEgg
    const unpaidDebt = sales.filter(s => s.status === 'UNPAID').reduce((s, r) => s + r.total, 0)

    return {
      goodEggs, feedCost, salaryCost, otherCost, totalExpenses,
      totalRevenue, profit, costPerEgg, costPerCrate,
      suggestedPerEgg, suggestedPerCrate, avgActualPerEgg,
      isSellingAtLoss, unpaidDebt, marginPct,
    }
  }
}
