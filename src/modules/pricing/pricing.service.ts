import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class PricingService {
  constructor(private prisma: PrismaService) {}

  async calculate(farmId: string, marginPct = 25) {
    const [production, stockOuts, expenses, sales, workers] = await Promise.all([
      this.prisma.production.findMany({ where: { farmId } }),
      this.prisma.stockOut.findMany({ where: { farmId } }),
      this.prisma.expense.findMany({ where: { farmId } }),
      this.prisma.sale.findMany({ where: { farmId } }),
      this.prisma.worker.findMany({ where: { farmId } }),
    ])

    const goodEggs = production.reduce((s, r) => s + r.goodEggs, 0)
    // Stock out costs replace feed costs (FIFO-costed)
    const stockCost = stockOuts.reduce((s, r) => s + r.costUsed, 0)
    const salaryCost = workers.reduce((s, w) => s + w.salary, 0)
    const otherCost = expenses.reduce((s, r) => s + r.amount, 0)
    const totalExpenses = stockCost + salaryCost + otherCost
    const totalRevenue = sales.reduce((s, r) => s + r.total, 0)
    const profit = totalRevenue - totalExpenses
    const costPerEgg = goodEggs > 0 ? totalExpenses / goodEggs : 0
    const costPerCrate = costPerEgg * 30
    const suggestedPerEgg = costPerEgg * (1 + marginPct / 100)
    const suggestedPerCrate = suggestedPerEgg * 30

    const totalEggsSold = sales.reduce((s, r) => s + r.crates * 30, 0)
    const avgActualPerEgg = totalEggsSold > 0 ? totalRevenue / totalEggsSold : 0
    const isSellingAtLoss = avgActualPerEgg > 0 && avgActualPerEgg < costPerEgg

    const otherSales = await this.prisma.otherSale.findMany({ where: { farmId } })
    const otherRevenue = otherSales.reduce((s, r) => s + r.total, 0)
    const unpaidDebt = [...sales, ...otherSales].filter(s => s.status === 'UNPAID').reduce((s, r) => s + r.total, 0)

    return {
      goodEggs, stockCost, salaryCost, otherCost, totalExpenses,
      totalRevenue: totalRevenue + otherRevenue, eggRevenue: totalRevenue, otherRevenue,
      profit: (totalRevenue + otherRevenue) - totalExpenses,
      costPerEgg, costPerCrate, suggestedPerEgg, suggestedPerCrate,
      avgActualPerEgg, isSellingAtLoss, unpaidDebt, marginPct,
    }
  }
}
