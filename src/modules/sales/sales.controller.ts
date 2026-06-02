import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { SalesService } from './sales.service'
import { CreateSaleDto } from './sales.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'

@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(private svc: SalesService) {}

  @Post() create(@Body() dto: CreateSaleDto) { return this.svc.create(dto) }
  @Get() findAll(@Query('farmId') farmId: string) { return this.svc.findAll(farmId) }
  @Delete(':id') remove(@Param('id') id: string) { return this.svc.remove(id) }
}
