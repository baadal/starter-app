import { Request, Response } from 'express';

import { currentOrigin } from 'starter/utils/server-utils';
import { createAccessToken } from 'starter/utils/auth-token';
import { authorizedUserRequest } from 'starter/utils/auth-req-web';

export const renewToken = async (req: Request, res: Response) => {
  // Disallow cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', currentOrigin(req));

  // Disallow requests from other origin
  let validReferer = false;
  const referer = req.get('Referrer');
  if (referer) {
    const refererUrl = new URL(referer);
    validReferer = refererUrl.host === req.get('Host');
  }

  if (validReferer) {
    const authUser = await authorizedUserRequest(req);
    if (authUser) {
      const { accessToken, tokenExpiry } = createAccessToken(authUser) || {};
      if (accessToken && tokenExpiry) {
        res.json({ status: 'ok', data: { token: accessToken, token_expiry: tokenExpiry } });
        return;
      }
    }
  }

  res.status(401).json({
    status: 'error',
    message: '401 unauthorized',
  });
};
