import { IsString, IsInt, IsOptional, Min } from 'class-validator'

export class CreatePenDto {
  @IsString() name: string
  @IsInt() @Min(1) totalBirds: number
  @IsString() farmId: string
  @IsString() @IsOptional() workerId?: string
}

export class UpdatePenDto {
  @IsString() @IsOptional() name?: string
  @IsInt() @Min(1) @IsOptional() totalBirds?: number
  @IsString() @IsOptional() workerId?: string
}
