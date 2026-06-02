import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { PayrollService } from './payroll.service'
import { CreatePayrollDto } from './payroll.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'

@Controller('payroll')
@UseGuards(JwtAuthGuard)
export class PayrollController {
  constructor(private svc: PayrollService) {}

  @Post() create(@Body() dto: CreatePayrollDto) { return this.svc.create(dto) }
  @Get() findAll(@Query('farmId') farmId: string) { return this.svc.findAll(farmId) }
  @Delete(':id') remove(@Param('id') id: string) { return this.svc.remove(id) }
}
