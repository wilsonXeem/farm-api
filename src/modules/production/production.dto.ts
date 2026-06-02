import { IsString, IsInt, IsOptional, Min } from 'class-validator'

export class CreateProductionDto {
  @IsString() date: string
  @IsInt() @Min(0) totalEggs: number
  @IsInt() @Min(0) @IsOptional() crackedEggs?: number
  @IsInt() @Min(0) @IsOptional() spoiltEggs?: number
  @IsString() @IsOptional() notes?: string
  @IsString() farmId: string
  @IsString() @IsOptional() penId?: string
}
