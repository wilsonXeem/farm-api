import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { WorkersService } from './workers.service'
import { CreateWorkerDto, UpdateWorkerDto } from './workers.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'

@Controller('workers')
@UseGuards(JwtAuthGuard)
export class WorkersController {
  constructor(private svc: WorkersService) {}

  @Post() create(@Body() dto: CreateWorkerDto) { return this.svc.create(dto) }
  @Get() findAll(@Query('farmId') farmId: string) { return this.svc.findAll(farmId) }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateWorkerDto) { return this.svc.update(id, dto) }
  @Delete(':id') remove(@Param('id') id: string) { return this.svc.remove(id) }
}
