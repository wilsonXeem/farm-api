import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateWorkerDto, UpdateWorkerDto } from './workers.dto'

@Injectable()
export class WorkersService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateWorkerDto) {
    return this.prisma.worker.create({ data: { ...dto, employedDate: new Date(dto.employedDate) } })
  }

  findAll(farmId: string) {
    return this.prisma.worker.findMany({ where: { farmId }, orderBy: { name: 'asc' } })
  }

  async update(id: string, dto: UpdateWorkerDto) {
    const rec = await this.prisma.worker.findUnique({ where: { id } })
    if (!rec) throw new NotFoundException()
    return this.prisma.worker.update({ where: { id }, data: dto })
  }

  async remove(id: string) {
    const rec = await this.prisma.worker.findUnique({ where: { id } })
    if (!rec) throw new NotFoundException()
    return this.prisma.worker.delete({ where: { id } })
  }
}
