import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common'
import { ROLES_KEY } from '../guards/roles.guard'

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles)

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest().user,
)
