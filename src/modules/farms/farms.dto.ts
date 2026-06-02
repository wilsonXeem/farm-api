import { IsString, IsOptional, IsInt, Min } from 'class-validator'

export class CreateFarmDto {
  @IsString() name: string
  @IsString() @IsOptional() location?: string
  @IsInt() @Min(1) @IsOptional() totalBirds?: number
}

export class UpdateFarmDto {
  @IsString() @IsOptional() name?: string
  @IsString() @IsOptional() location?: string
  @IsInt() @Min(1) @IsOptional() totalBirds?: number
}
