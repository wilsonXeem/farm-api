import { IsString, IsNumber, IsOptional, Min } from 'class-validator'

export class CreateWorkerDto {
  @IsString() name: string
  @IsString() role: string
  @IsNumber() @Min(0) salary: number
  @IsString() @IsOptional() phone?: string
  @IsString() employedDate: string
  @IsString() farmId: string
  @IsString() @IsOptional() type?: string
}

export class UpdateWorkerDto {
  @IsString() @IsOptional() name?: string
  @IsString() @IsOptional() role?: string
  @IsNumber() @Min(0) @IsOptional() salary?: number
  @IsString() @IsOptional() phone?: string
  @IsString() @IsOptional() type?: string
}
