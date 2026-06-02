import { IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator'

export enum PaymentStatus {
  PAID = 'PAID',
  UNPAID = 'UNPAID',
  PART_PAYMENT = 'PART_PAYMENT',
}

export class CreateSaleDto {
  @IsString() date: string
  @IsString() @IsOptional() customer?: string
  @IsNumber() @Min(0) crates: number
  @IsNumber() @Min(0) pricePerCrate: number
  @IsNumber() @Min(0) total: number
  @IsEnum(PaymentStatus) @IsOptional() status?: PaymentStatus
  @IsString() farmId: string
}
