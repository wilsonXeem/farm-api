import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreatePayrollDto } from './payroll.dto'

@Injectable()
export class PayrollService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePayrollDto) {
    const already = await this.prisma.payroll.findFirst({
      where: { workerId: dto.workerId, month: dto.month, deletedAt: null },
    })
    if (already) throw new ConflictException('Worker already paid for this month')
    return this.prisma.payroll.create({ data: { ...dto, date: new Date(dto.date) } })
  }

  findAll(farmId: string) {
    return this.prisma.payroll.findMany({
      where: { farmId, deletedAt: null },
      include: { worker: { select: { name: true, role: true } } },
      orderBy: { date: 'desc' },
    })
  }

  async remove(id: string) {
    const rec = await this.prisma.payroll.findUnique({ where: { id } })
    if (!rec) throw new NotFoundException()
    return this.prisma.payroll.update({ where: { id }, data: { deletedAt: new Date() } })
  }
}
