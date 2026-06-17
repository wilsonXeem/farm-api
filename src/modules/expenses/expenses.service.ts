import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateExpenseDto } from './expenses.dto'

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateExpenseDto) {
    return this.prisma.expense.create({ data: { ...dto, date: new Date(dto.date) } })
  }

  findAll(farmId: string) {
    return this.prisma.expense.findMany({ where: { farmId, deletedAt: null }, orderBy: { date: 'desc' } })
  }

  async remove(id: string) {
    const rec = await this.prisma.expense.findUnique({ where: { id } })
    if (!rec) throw new NotFoundException()
    return this.prisma.expense.update({ where: { id }, data: { deletedAt: new Date() } })
  }
}
