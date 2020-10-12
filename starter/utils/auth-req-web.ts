import { Request } from 'express';

import { validateToken, decodeTokenUnverified } from 'starter/utils/auth-token';
import { COOKIE_AUTH_SESSION_TOKEN } from 'starter/utils/auth-cookie';
import { fetchAuthUser } from 'starter/utils/auth-utils';
import logger from 'starter/utils/logger';

export const authorizedUserRequest = async (req: Request) => {
  if (!req.signedCookies) return null;

  try {
    const refreshToken = req.signedCookies[COOKIE_AUTH_SESSION_TOKEN];
    if (!refreshToken) return null;

    const decoded = decodeTokenUnverified(refreshToken);
    if (!decoded) return null; // token expired

    const userid = decoded.payload.user.id || '';
    const keyid = decoded.header.kid || '';
    const authUser = await fetchAuthUser(userid, keyid);
    if (!authUser || !authUser.id) return null;

    const refreshSecret = authUser.key?.refreshSecret || '';
    const payload = validateToken(refreshToken, refreshSecret);
    if (!payload) return null;

    if (authUser.id !== payload?.user?.id) {
      logger.error('[Unexpected ERROR] user id mismatch!');
      return null;
    }
    return authUser;
  } catch (e) {
    logger.error('Error while authorizedUserRequest: ', e);
  }

  return null;
};
