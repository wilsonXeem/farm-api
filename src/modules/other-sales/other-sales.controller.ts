import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { OtherSalesService } from './other-sales.service'
import { CreateOtherSaleDto } from './other-sales.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'

@Controller('other-sales')
@UseGuards(JwtAuthGuard)
export class OtherSalesController {
  constructor(private svc: OtherSalesService) {}

  @Post() create(@Body() dto: CreateOtherSaleDto) { return this.svc.create(dto) }
  @Get() findAll(@Query('farmId') farmId: string) { return this.svc.findAll(farmId) }
  @Delete(':id') remove(@Param('id') id: string) { return this.svc.remove(id) }
}
