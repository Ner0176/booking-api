import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export class UserCookie {
  id: number;
  isAdmin: boolean;
}

export const User = createParamDecorator((_, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user as UserCookie;
});
