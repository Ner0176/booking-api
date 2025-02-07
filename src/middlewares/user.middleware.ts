import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export class UserMiddleWare implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const userCookie = req.cookies['user'];
    if (userCookie) {
      req['user'] = JSON.parse(userCookie);
    }
    next();
  }
}
