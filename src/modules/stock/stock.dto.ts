import { IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator'

export enum StockCategory {
  FEED = 'FEED',
  MEDICATION = 'MEDICATION',
  EQUIPMENT = 'EQUIPMENT',
  SUPPLIES = 'SUPPLIES',
  OTHER = 'OTHER',
}

export class CreateStockDto {
  @IsString() name: string
  @IsEnum(StockCategory) @IsOptional() category?: StockCategory
  @IsString() unit: string
  @IsNumber() @Min(0) @IsOptional() minQty?: number
  @IsString() @IsOptional() supplier?: string
  @IsString() farmId: string
}

export class StockInDto {
  @IsString() stockId: string
  @IsString() date: string
  @IsNumber() @Min(0.01) qty: number
  @IsNumber() @Min(0) unitPrice: number
  @IsString() @IsOptional() supplier?: string
  @IsString() @IsOptional() notes?: string
  @IsString() farmId: string
}

export class StockOutDto {
  @IsString() stockId: string
  @IsString() date: string
  @IsNumber() @Min(0.01) qty: number
  @IsString() @IsOptional() reason?: string
  @IsString() @IsOptional() penId?: string
  @IsString() farmId: string
}
