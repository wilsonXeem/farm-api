import { IsString, IsInt, IsOptional, IsNumber, Min } from 'class-validator'

export class CreateFarmDto {
  @IsString() name: string
  @IsString() @IsOptional() location?: string
  @IsInt() @Min(1) @IsOptional() totalBirds?: number
  @IsNumber() @IsOptional() priceJumbo?: number
  @IsNumber() @IsOptional() priceMedium?: number
  @IsNumber() @IsOptional() priceTable?: number
}

export class UpdateFarmDto {
  @IsString() @IsOptional() name?: string
  @IsString() @IsOptional() location?: string
  @IsInt() @Min(1) @IsOptional() totalBirds?: number
  @IsNumber() @IsOptional() priceJumbo?: number
  @IsNumber() @IsOptional() priceMedium?: number
  @IsNumber() @IsOptional() priceTable?: number
  @IsString() @IsOptional() bankName?: string
  @IsString() @IsOptional() bankAccount?: string
  @IsString() @IsOptional() bankAccountName?: string
}
