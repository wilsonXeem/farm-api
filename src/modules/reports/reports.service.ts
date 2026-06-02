import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async generate(farmId: string, mode: 'daily' | 'weekly' | 'monthly' = 'daily') {
    const now = new Date()
    let from: Date

    if (mode === 'daily') {
      from = new Date(now)
      from.setDate(from.getDate() - 6)
    } else if (mode === 'weekly') {
      from = new Date(now)
      from.setDate(from.getDate() - 27)
    } else {
      from = new Date(now.getFullYear(), now.getMonth() - 2, 1)
    }
    from.setHours(0, 0, 0, 0)

    const [production, expenses, sales, mortality] = await Promise.all([
      this.prisma.production.findMany({ where: { farmId, date: { gte: from } } }),
      this.prisma.expense.findMany({ where: { farmId, date: { gte: from } } }),
      this.prisma.sale.findMany({ where: { farmId, date: { gte: from } } }),
      this.prisma.mortality.findMany({ where: { farmId, date: { gte: from } } }),
    ])

    const dateKey = (d: Date) => d.toISOString().split('T')[0]

    const totalGoodEggs = production.reduce((s, r) => s + r.goodEggs, 0)
    const totalExpenses = expenses.reduce((s, r) => s + r.amount, 0)
    const totalRevenue = sales.reduce((s, r) => s + r.total, 0)
    const totalMortality = mortality.reduce((s, r) => s + r.count, 0)
    const netProfit = totalRevenue - totalExpenses

    return {
      mode, from: from.toISOString(), to: now.toISOString(),
      summary: { totalGoodEggs, totalExpenses, totalRevenue, totalMortality, netProfit },
      production: production.map(r => ({ ...r, date: dateKey(r.date) })),
      expenses: expenses.map(r => ({ ...r, date: dateKey(r.date) })),
      sales: sales.map(r => ({ ...r, date: dateKey(r.date) })),
      mortality: mortality.map(r => ({ ...r, date: dateKey(r.date) })),
    }
  }
}
