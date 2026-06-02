import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ProductionService } from './production.service'
import { CreateProductionDto } from './production.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser } from '../../common/decorators'

@Controller('production')
@UseGuards(JwtAuthGuard)
export class ProductionController {
  constructor(private svc: ProductionService) {}

  @Post() create(@Body() dto: CreateProductionDto) { return this.svc.create(dto) }

  @Get()
  findAll(
    @Query('farmId') farmId: string,
    @Query('penId') penId: string,
    @CurrentUser() user: any,
  ) {
    const workerId = user.role === 'STAFF' ? user.workerId : undefined
    return this.svc.findAll(farmId, penId, workerId)
  }

  @Delete(':id') remove(@Param('id') id: string) { return this.svc.remove(id) }
}
