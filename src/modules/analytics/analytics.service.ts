import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async trends(farmId: string, days = 7) {
    const from = new Date()
    from.setDate(from.getDate() - (days - 1))
    from.setHours(0, 0, 0, 0)

    const [production, expenses, sales, mortality] = await Promise.all([
      this.prisma.production.findMany({ where: { farmId, date: { gte: from } }, orderBy: { date: 'asc' } }),
      this.prisma.expense.findMany({ where: { farmId, date: { gte: from } }, orderBy: { date: 'asc' } }),
      this.prisma.sale.findMany({ where: { farmId, date: { gte: from } }, orderBy: { date: 'asc' } }),
      this.prisma.mortality.findMany({ where: { farmId, date: { gte: from } }, orderBy: { date: 'asc' } }),
    ])

    const dateKey = (d: Date) => d.toISOString().split('T')[0]
    const dates: string[] = []
    for (let i = 0; i < days; i++) {
      const d = new Date(from)
      d.setDate(d.getDate() + i)
      dates.push(dateKey(d))
    }

    return dates.map(date => ({
      date,
      goodEggs: production.filter(r => dateKey(r.date) === date).reduce((s, r) => s + r.goodEggs, 0),
      crackedEggs: production.filter(r => dateKey(r.date) === date).reduce((s, r) => s + r.crackedEggs, 0),
      spoiltEggs: production.filter(r => dateKey(r.date) === date).reduce((s, r) => s + r.spoiltEggs, 0),
      revenue: sales.filter(r => dateKey(r.date) === date).reduce((s, r) => s + r.total, 0),
      expenses: expenses.filter(r => dateKey(r.date) === date).reduce((s, r) => s + r.amount, 0),
      deaths: mortality.filter(r => dateKey(r.date) === date).reduce((s, r) => s + r.count, 0),
    }))
  }

  async summary(farmId: string) {
    const farm = await this.prisma.farm.findUnique({ where: { id: farmId } })
    const [production, mortality, workers] = await Promise.all([
      this.prisma.production.findMany({ where: { farmId } }),
      this.prisma.mortality.findMany({ where: { farmId } }),
      this.prisma.worker.findMany({ where: { farmId } }),
    ])
    const totalMortality = mortality.reduce((s, r) => s + r.count, 0)
    const availableBirds = (farm?.totalBirds ?? 0) - totalMortality
    const totalGoodEggs = production.reduce((s, r) => s + r.goodEggs, 0)
    return { availableBirds, totalMortality, totalGoodEggs, totalBirds: farm?.totalBirds ?? 0 }
  }
}
