import { Request } from 'express';

import { validateAccessToken } from 'starter/utils/auth-token';
import { AuthUser } from 'starter/core/model/auth.model';
import logger from 'starter/utils/logger';

export const authorizedResourceRequest = (req: Request) => {
  const authorization = req.headers.authorization || '';
  if (!authorization || !authorization.toLowerCase().startsWith('bearer')) {
    return null;
  }

  const accessToken = authorization.substr('bearer'.length).trim();
  if (!accessToken) {
    logger.error('[ERROR:authorizedResourceRequest] Missing accessToken:', accessToken);
    return null;
  }

  const payload = validateAccessToken(accessToken);
  if (!payload) return null;

  let authUser: AuthUser | null = null;

  const user = payload?.user || null;
  if (user) {
    authUser = {
      id: user.id,
      name: user.name || '',
      avatar: user.avatar || '',
    };
  }

  return authUser;
};
