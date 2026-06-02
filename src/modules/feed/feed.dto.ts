import { IsString, IsNumber, IsOptional, Min } from 'class-validator'

export class CreateFeedDto {
  @IsString() date: string
  @IsString() item: string
  @IsNumber() @Min(0) qty: number
  @IsNumber() @Min(0) unitPrice: number
  @IsNumber() @Min(0) totalCost: number
  @IsString() @IsOptional() supplier?: string
  @IsString() farmId: string
}
