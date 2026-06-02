import { Module } from '@nestjs/common'
import { PensService } from './pens.service'
import { PensController } from './pens.controller'

@Module({ providers: [PensService], controllers: [PensController], exports: [PensService] })
export class PensModule {}
