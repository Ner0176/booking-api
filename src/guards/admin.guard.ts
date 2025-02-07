import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

export class AdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req: Request = context.switchToHttp().getRequest();

    if (!req['user']) {
      throw new UnauthorizedException('You must be logged in');
    }

    if (!req['user'].isAdmin) {
      throw new ForbiddenException('You must be admin to access this resource');
    }

    return true;
  }
}
