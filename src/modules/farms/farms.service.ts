import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateFarmDto, UpdateFarmDto } from './farms.dto'

@Injectable()
export class FarmsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateFarmDto) {
    return this.prisma.farm.create({ data: dto })
  }

  findAll() {
    return this.prisma.farm.findMany({ include: { _count: { select: { workers: true, production: true } } } })
  }

  async findOne(id: string) {
    const farm = await this.prisma.farm.findUnique({ where: { id } })
    if (!farm) throw new NotFoundException('Farm not found')
    return farm
  }

  async update(id: string, dto: UpdateFarmDto) {
    await this.findOne(id)
    return this.prisma.farm.update({ where: { id }, data: dto })
  }

  async remove(id: string) {
    await this.findOne(id)
    return this.prisma.farm.delete({ where: { id } })
  }
}
