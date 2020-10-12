import { Request, Response, NextFunction } from 'express';

import { isWebpagePath } from 'starter/ssr/server-utils';
import { createAccessToken } from './auth-token';
import { authorizedUserRequest } from './auth-req-web';

export const authMiddleware = () => async (req: Request, res: Response, next: NextFunction) => {
  const isWebpage = isWebpagePath(req.path);
  if (!isWebpage) return next();

  const isBackChannel = /^\/(server)$/.test(req.path) || /^\/(server)\//.test(req.path);

  /**
   * Back channel request:
   * currently (bearer) access token in authorization header are only used for api requests, not server requests
   * For error/expiry, client renews access token using /refresh-token endpoint
   * /refresh-token endpoint just needs refresh token (from cookie), so it's security is paramount
   */
  if (isBackChannel) {
    // const authUser = authorizedResourceRequest(req);
    // if (authUser) {
    //   res.locals.authInfo = { user: authUser };
    // }

    return next();
  }

  /**
   * Front channel request: access token not available on page refresh (or fresh navigation)
   * Validate refresh token, and return new access token in page-data
   */
  const authUser = await authorizedUserRequest(req);
  if (authUser) {
    const { accessToken, tokenExpiry } = createAccessToken(authUser) || {};
    if (accessToken && tokenExpiry) {
      res.locals.authInfo = { token: accessToken, token_expiry: tokenExpiry };
    }
  }

  return next();
};
