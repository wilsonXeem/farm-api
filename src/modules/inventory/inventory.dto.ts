import { IsString, IsNumber, IsOptional, Min } from 'class-validator'

export class CreateInventoryDto {
  @IsString() item: string
  @IsNumber() @Min(0) qty: number
  @IsString() unit: string
  @IsNumber() @Min(0) unitPrice: number
  @IsNumber() @Min(0) @IsOptional() minQty?: number
  @IsString() @IsOptional() supplier?: string
  @IsString() farmId: string
}

export class UpdateInventoryDto {
  @IsNumber() @Min(0) @IsOptional() qty?: number
  @IsNumber() @Min(0) @IsOptional() unitPrice?: number
  @IsNumber() @Min(0) @IsOptional() minQty?: number
  @IsString() @IsOptional() supplier?: string
}
