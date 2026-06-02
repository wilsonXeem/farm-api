import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { MortalityService } from './mortality.service'
import { CreateMortalityDto } from './mortality.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser } from '../../common/decorators'

@Controller('mortality')
@UseGuards(JwtAuthGuard)
export class MortalityController {
  constructor(private svc: MortalityService) {}

  @Post() create(@Body() dto: CreateMortalityDto) { return this.svc.create(dto) }

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
