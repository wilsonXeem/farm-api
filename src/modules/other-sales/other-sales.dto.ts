import { IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator'

export enum PaymentStatus {
  PAID = 'PAID',
  UNPAID = 'UNPAID',
  PART_PAYMENT = 'PART_PAYMENT',
}

export const OTHER_SALE_ITEMS = ['Cracks', 'Sacks', 'Manure', 'Old Cages', 'Hens', 'Other']

export class CreateOtherSaleDto {
  @IsString() date: string
  @IsString() item: string
  @IsNumber() @Min(0) qty: number
  @IsString() unit: string
  @IsNumber() @Min(0) unitPrice: number
  @IsNumber() @Min(0) total: number
  @IsString() @IsOptional() customer?: string
  @IsEnum(PaymentStatus) @IsOptional() status?: PaymentStatus
  @IsString() @IsOptional() penId?: string
  @IsString() farmId: string
}
