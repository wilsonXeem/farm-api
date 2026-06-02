import { IsString, IsNumber, Min } from 'class-validator'

export class CreatePayrollDto {
  @IsString() workerId: string
  @IsNumber() @Min(0) amount: number
  @IsString() month: string
  @IsString() date: string
  @IsString() farmId: string
}
