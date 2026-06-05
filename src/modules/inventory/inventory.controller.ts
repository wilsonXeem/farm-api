import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { InventoryService } from './inventory.service'
import { CreateInventoryDto, UpdateInventoryDto, StockMovementDto } from './inventory.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private svc: InventoryService) {}

  @Post() create(@Body() dto: CreateInventoryDto) { return this.svc.create(dto) }
  @Get() findAll(@Query('farmId') farmId: string) { return this.svc.findAll(farmId) }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateInventoryDto) { return this.svc.update(id, dto) }
  @Delete(':id') remove(@Param('id') id: string) { return this.svc.remove(id) }

  @Post('stock-in') stockIn(@Body() dto: StockMovementDto) { return this.svc.stockIn(dto) }
  @Post('stock-out') stockOut(@Body() dto: StockMovementDto) { return this.svc.stockOut(dto) }
  @Get('movements') getMovements(@Query('farmId') farmId: string, @Query('inventoryId') inventoryId?: string) {
    return this.svc.getMovements(farmId, inventoryId)
  }
}
