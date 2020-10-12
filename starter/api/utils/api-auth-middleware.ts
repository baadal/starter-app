import { Request, Response, NextFunction } from 'express';

import { authorizedResourceRequest } from 'starter/utils/auth-req-api';

export const apiAuthMiddleware = () => (req: Request, res: Response, next: NextFunction) => {
  const authUser = authorizedResourceRequest(req);
  if (authUser) {
    res.locals.authInfo = { user: authUser };
  }

  return next();
};
