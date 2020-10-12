import { Request, Response, NextFunction } from 'express';

export const reqMiddleware = () => (req: Request, res: Response, next: NextFunction) => {
  const { originalUrl } = req;
  let path = originalUrl;
  let query = '';

  const index = originalUrl.indexOf('?');
  if (index > 0) {
    path = originalUrl.substr(0, index);
    query = originalUrl.substr(index);
  }

  path = path.replace(/\/{2,}/g, '/');
  const nextUrl = path + query;
  if (nextUrl !== originalUrl) {
    return res.redirect(301, nextUrl);
  }

  return next();
};
