import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { PricingService } from './pricing.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'

@Controller('pricing')
@UseGuards(JwtAuthGuard)
export class PricingController {
  constructor(private svc: PricingService) {}

  @Get()
  calculate(@Query('farmId') farmId: string, @Query('margin') margin?: string) {
    return this.svc.calculate(farmId, margin ? Number(margin) : 25)
  }
}
