import { Module } from '@nestjs/common'
import { FeedFormulaService } from './feed-formula.service'
import { FeedFormulaController } from './feed-formula.controller'

@Module({ providers: [FeedFormulaService], controllers: [FeedFormulaController] })
export class FeedFormulaModule {}
