import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { AnalyticsService } from './analytics.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private svc: AnalyticsService) {}

  @Get('trends')
  trends(@Query('farmId') farmId: string, @Query('days') days?: string) {
    return this.svc.trends(farmId, days ? Number(days) : 7)
  }

  @Get('summary')
  summary(@Query('farmId') farmId: string) {
    return this.svc.summary(farmId)
  }
}
