import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { FeedService } from './feed.service'
import { CreateFeedDto } from './feed.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'

@Controller('feed')
@UseGuards(JwtAuthGuard)
export class FeedController {
  constructor(private svc: FeedService) {}

  @Post() create(@Body() dto: CreateFeedDto) { return this.svc.create(dto) }
  @Get() findAll(@Query('farmId') farmId: string) { return this.svc.findAll(farmId) }
  @Delete(':id') remove(@Param('id') id: string) { return this.svc.remove(id) }
}
