import { IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator'

export enum ExpenseCategory {
  FUEL = 'FUEL',
  CONSTRUCTION = 'CONSTRUCTION',
  SALARY = 'SALARY',
  MEDICATION = 'MEDICATION',
  REPAIRS = 'REPAIRS',
  TRANSPORT = 'TRANSPORT',
  ELECTRICITY = 'ELECTRICITY',
  WATER = 'WATER',
  MISCELLANEOUS = 'MISCELLANEOUS',
}

export class CreateExpenseDto {
  @IsString() date: string
  @IsEnum(ExpenseCategory) category: ExpenseCategory
  @IsNumber() @Min(0) amount: number
  @IsString() @IsOptional() description?: string
  @IsString() @IsOptional() receipt?: string
  @IsString() farmId: string
}
