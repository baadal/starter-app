import { Request, Response } from 'express';

import analytics from 'starter/utils/analytics';
import { resetRefreshTokenCookie } from 'starter/utils/auth-cookie';

export const doLogout = async (req: Request, res: Response) => {
  resetRefreshTokenCookie(req, res);

  // TODO: revoke access of the refreshToken in DB

  // send analytics event for successful logout
  await analytics.event(req, 'logout');

  // res.redirect('/');
  res.json({ status: 'ok', message: 'logout successful' });
};
