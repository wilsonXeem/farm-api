import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class IngredientDto {
  @IsString() stockId: string
  @IsNumber() @Min(0.001) qtyPerUnit: number
}

export class CreateFormulaDto {
  @IsString() name: string
  @IsString() @IsOptional() description?: string
  @IsString() @IsOptional() unit?: string
  @IsArray() @ValidateNested({ each: true }) @Type(() => IngredientDto) ingredients: IngredientDto[]
  @IsString() farmId: string
}

export class ProduceBatchDto {
  @IsString() formulaId: string
  @IsString() date: string
  @IsString() batchNo: string
  @IsNumber() @Min(0.01) qtyProduced: number
  @IsString() @IsOptional() notes?: string
  @IsString() farmId: string
}

export class RecordUsageDto {
  @IsString() batchId: string
  @IsString() date: string
  @IsNumber() @Min(0.01) qty: number
  @IsString() @IsOptional() penId?: string
  @IsString() @IsOptional() notes?: string
  @IsString() farmId: string
}
