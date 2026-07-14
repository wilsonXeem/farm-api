import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '../../prisma/prisma.service'
import { RegisterDto, LoginDto, ChangePasswordDto } from './auth.dto'

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (exists) throw new ConflictException('Email already in use')
    const hashed = await bcrypt.hash(dto.password, 10)
    const user = await this.prisma.user.create({
      data: { name: dto.name, email: dto.email, password: hashed, role: dto.role, farmId: dto.farmId },
    })
    return this.sign(user)
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (!user) throw new UnauthorizedException('Invalid credentials')
    const valid = await bcrypt.compare(dto.password, user.password)
    if (!valid) throw new UnauthorizedException('Invalid credentials')
    return this.sign(user)
  }

  async me(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, farmId: true, workerId: true, hasChangedPassword: true, createdAt: true },
    })
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new UnauthorizedException('User not found')
    const valid = await bcrypt.compare(dto.currentPassword, user.password)
    if (!valid) throw new UnauthorizedException('Current password is incorrect')
    const hashed = await bcrypt.hash(dto.newPassword, 10)
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed, hasChangedPassword: true },
    })
    return this.sign(updated)
  }

  private sign(user: { id: string; name: string; email: string; role: string; farmId: string | null; workerId?: string | null; hasChangedPassword: boolean }) {
    const payload = { sub: user.id, email: user.email, role: user.role, farmId: user.farmId, workerId: user.workerId ?? null }
    return {
      access_token: this.jwt.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        farmId: user.farmId,
        workerId: user.workerId ?? null,
        hasChangedPassword: user.hasChangedPassword,
      },
    }
  }
}
