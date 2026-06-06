import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { StockService } from './stock.service'
import { CreateStockDto, StockInDto, StockOutDto } from './stock.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'

@Controller('stock')
@UseGuards(JwtAuthGuard)
export class StockController {
  constructor(private svc: StockService) {}

  @Post() create(@Body() dto: CreateStockDto) { return this.svc.create(dto) }
  @Get() findAll(@Query('farmId') farmId: string) { return this.svc.findAll(farmId) }
  @Delete(':id') remove(@Param('id') id: string) { return this.svc.remove(id) }

  @Post('in') stockIn(@Body() dto: StockInDto) { return this.svc.stockIn(dto) }
  @Post('out') stockOut(@Body() dto: StockOutDto) { return this.svc.stockOut(dto) }

  @Get('movements') getMovements(@Query('farmId') farmId: string, @Query('stockId') stockId?: string) {
    return this.svc.getMovements(farmId, stockId)
  }
  @Get(':id/batches') getBatches(@Param('id') id: string) { return this.svc.getBatches(id) }
  @Get('feed-cost') getFeedCost(@Query('farmId') farmId: string) { return this.svc.getTotalFeedCost(farmId) }
}
