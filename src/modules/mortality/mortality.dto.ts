import { IsString, IsInt, IsOptional, Min } from 'class-validator'

export class CreateMortalityDto {
  @IsString() date: string
  @IsInt() @Min(1) count: number
  @IsString() @IsOptional() cause?: string
  @IsString() @IsOptional() notes?: string
  @IsString() farmId: string
  @IsString() @IsOptional() penId?: string
}
