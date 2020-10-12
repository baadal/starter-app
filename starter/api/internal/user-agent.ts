import { Request } from 'express';

import { getUserAgentInfo } from 'starter/ssr/server-utils';
import { checkESModulesSupport } from 'starter/ssr/utils';
import { UserAgentData } from 'starter/core/model/ssr.model';

export const userAgentData = (req: Request): UserAgentData => {
  const userAgent = req.headers['user-agent'] || '';
  const userAgentInfo = getUserAgentInfo(userAgent);
  const esmSupported = checkESModulesSupport(userAgentInfo);
  return { ...userAgentInfo, esmSupported };
};
