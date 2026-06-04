import { Module } from '@nestjs/common'
import { OtherSalesService } from './other-sales.service'
import { OtherSalesController } from './other-sales.controller'

@Module({ providers: [OtherSalesService], controllers: [OtherSalesController] })
export class OtherSalesModule {}
