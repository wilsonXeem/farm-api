import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { PensService } from './pens.service'
import { CreatePenDto, UpdatePenDto, AddBirdsDto } from './pens.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser } from '../../common/decorators'

@Controller('pens')
@UseGuards(JwtAuthGuard)
export class PensController {
  constructor(private svc: PensService) {}

  @Post() create(@Body() dto: CreatePenDto) { return this.svc.create(dto) }

  @Get()
  findAll(@Query('farmId') farmId: string, @CurrentUser() user: any) {
    if (user.role === 'STAFF' && user.workerId) return this.svc.findByWorker(user.workerId)
    return this.svc.findAll(farmId)
  }

  @Get('bird-entries') getAllBirdEntries(@Query('farmId') farmId: string) {
    return this.svc.getAllBirdEntries(farmId)
  }

  @Post(':id/birds') addBirds(@Param('id') id: string, @Body() dto: AddBirdsDto) {
    return this.svc.addBirds(id, dto)
  }

  @Get(':id/birds') getBirdEntries(@Param('id') id: string) {
    return this.svc.getBirdEntries(id)
  }

  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdatePenDto) { return this.svc.update(id, dto) }
  @Delete(':id') remove(@Param('id') id: string) { return this.svc.remove(id) }
}
