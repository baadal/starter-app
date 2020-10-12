import { Request, Response, CookieOptions } from 'express';

export const COOKIE_AUTH_SESSION_TOKEN = 'squid';
export const COOKIE_AUTH_SESSION_STATUS = 'pixel';

const isLocalhost = (req: Request) => {
  return req.hostname === 'localhost' || req.hostname === '127.0.0.1';
};

const refreshTokenCookieOptions = (req: Request): CookieOptions => ({
  secure: !isLocalhost(req),
  sameSite: 'lax',
  httpOnly: true,
});

const pixelCookieOptions = (req: Request): CookieOptions => ({
  secure: !isLocalhost(req),
  sameSite: 'lax',
});

export const setRefreshTokenCookie = (req: Request, res: Response, refreshToken: string, expiry: number) => {
  // JWT base-64 alphabet is url-safe, so refreshToken need not be urlencoded
  res.cookie(COOKIE_AUTH_SESSION_TOKEN, refreshToken, {
    ...refreshTokenCookieOptions(req),
    signed: true,
    expires: new Date(expiry),
  });

  res.cookie(COOKIE_AUTH_SESSION_STATUS, 'active', {
    ...pixelCookieOptions(req),
    expires: new Date(expiry),
  });
};

export const resetRefreshTokenCookie = (req: Request, res: Response) => {
  res.clearCookie(COOKIE_AUTH_SESSION_TOKEN, refreshTokenCookieOptions(req));
  res.clearCookie(COOKIE_AUTH_SESSION_STATUS, pixelCookieOptions(req));
};
