import { Response } from 'express';

export function setCookie(
  res: Response,
  data: { id: number; isAdmin: boolean },
) {
  res.cookie('user', JSON.stringify(data), {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    secure: false, //TODO: SET TO TRUE IN PRODUCTION
  });
}
