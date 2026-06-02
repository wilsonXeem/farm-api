import { IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator'
import { PaymentStatus } from '@prisma/client'

export class CreateSaleDto {
  @IsString() date: string
  @IsString() @IsOptional() customer?: string
  @IsNumber() @Min(0) crates: number
  @IsNumber() @Min(0) pricePerCrate: number
  @IsNumber() @Min(0) total: number
  @IsEnum(PaymentStatus) @IsOptional() status?: PaymentStatus
  @IsString() farmId: string
}
