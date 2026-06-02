import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator'
import { Role } from '@prisma/client'

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
