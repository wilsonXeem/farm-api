import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common'
import { FarmsService } from './farms.service'
import { CreateFarmDto, UpdateFarmDto } from './farms.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'

@Controller('farms')
@UseGuards(JwtAuthGuard)
export class FarmsController {
  constructor(private farms: FarmsService) {}

  @Post() create(@Body() dto: CreateFarmDto) { return this.farms.create(dto) }
  @Get() findAll() { return this.farms.findAll() }
  @Get(':id') findOne(@Param('id') id: string) { return this.farms.findOne(id) }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateFarmDto) { return this.farms.update(id, dto) }
  @Delete(':id') remove(@Param('id') id: string) { return this.farms.remove(id) }
}
