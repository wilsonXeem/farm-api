import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ReportsService } from './reports.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private svc: ReportsService) {}

  @Get()
  generate(
    @Query('farmId') farmId: string,
    @Query('mode') mode?: 'daily' | 'weekly' | 'monthly',
  ) {
    return this.svc.generate(farmId, mode ?? 'daily')
  }
}
