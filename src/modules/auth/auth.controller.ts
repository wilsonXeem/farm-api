import { Controller, Post, Get, Patch, Body, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterDto, LoginDto, ChangePasswordDto } from './auth.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser } from '../../common/decorators'

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) { return this.auth.register(dto) }

  @Post('login')
  login(@Body() dto: LoginDto) { return this.auth.login(dto) }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: { id: string }) { return this.auth.me(user.id) }

  @Patch('password')
  @UseGuards(JwtAuthGuard)
  changePassword(
    @CurrentUser() user: { id: string },
    @Body() dto: ChangePasswordDto,
  ) { return this.auth.changePassword(user.id, dto) }
}
