import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator'

export enum Role {
  ADMIN = 'ADMIN',
  FARM_MANAGER = 'FARM_MANAGER',
  ACCOUNTANT = 'ACCOUNTANT',
  SALES = 'SALES',
  STAFF = 'STAFF',
}

export class RegisterDto {
  @IsString() name: string
  @IsEmail() email: string
  @IsString() @MinLength(6) password: string
  @IsEnum(Role) @IsOptional() role?: Role
  @IsString() @IsOptional() farmId?: string
}

export class LoginDto {
  @IsEmail() email: string
  @IsString() password: string
}
