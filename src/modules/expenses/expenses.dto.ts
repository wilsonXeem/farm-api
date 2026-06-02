import { IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator'
import { ExpenseCategory } from '@prisma/client'

export class CreateExpenseDto {
  @IsString() date: string
  @IsEnum(ExpenseCategory) category: ExpenseCategory
  @IsNumber() @Min(0) amount: number
  @IsString() @IsOptional() description?: string
  @IsString() @IsOptional() receipt?: string
  @IsString() farmId: string
}
