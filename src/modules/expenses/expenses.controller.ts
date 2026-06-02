import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ExpensesService } from './expenses.service'
import { CreateExpenseDto } from './expenses.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private svc: ExpensesService) {}

  @Post() create(@Body() dto: CreateExpenseDto) { return this.svc.create(dto) }
  @Get() findAll(@Query('farmId') farmId: string) { return this.svc.findAll(farmId) }
  @Delete(':id') remove(@Param('id') id: string) { return this.svc.remove(id) }
}
