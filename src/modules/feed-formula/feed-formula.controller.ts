import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { FeedFormulaService } from './feed-formula.service'
import { CreateFormulaDto, ProduceBatchDto, RecordUsageDto } from './feed-formula.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'

@Controller('feed-formula')
@UseGuards(JwtAuthGuard)
export class FeedFormulaController {
  constructor(private svc: FeedFormulaService) {}

  // Formulas
  @Post('formulas') createFormula(@Body() dto: CreateFormulaDto) { return this.svc.createFormula(dto) }
  @Get('formulas') findFormulas(@Query('farmId') farmId: string) { return this.svc.findAllFormulas(farmId) }
  @Delete('formulas/:id') deleteFormula(@Param('id') id: string) { return this.svc.deleteFormula(id) }

  // Batches
  @Post('batches') produceBatch(@Body() dto: ProduceBatchDto) { return this.svc.produceBatch(dto) }
  @Get('batches') findBatches(@Query('farmId') farmId: string) { return this.svc.findAllBatches(farmId) }

  // Usage
  @Post('usage') recordUsage(@Body() dto: RecordUsageDto) { return this.svc.recordUsage(dto) }
  @Get('usage') findUsages(@Query('farmId') farmId: string, @Query('batchId') batchId?: string) {
    return this.svc.findAllUsages(farmId, batchId)
  }
}
