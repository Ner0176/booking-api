import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable, tap } from 'rxjs';

export function SetCookie() {
  return UseInterceptors(new SetCookieInterceptor());
}

class SetCookieInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const response = context.switchToHttp().getResponse<Response>();
    return next.handle().pipe(
      tap((user) => {
        if (user) {
          response.cookie(
            'user',
            JSON.stringify({ id: user.id, isAdmin: user.isAdmin }),
            {
              httpOnly: true,
              sameSite: 'strict',
              maxAge: 7 * 24 * 60 * 60 * 1000,
              secure: false, //TODO: SET TO TRUE IN PRODUCTION
            },
          );
        }
      }),
    );
  }
}
