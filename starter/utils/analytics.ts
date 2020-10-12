import { Request } from 'express';
import { aws } from '@baadal-sdk/dapi';

import { getUserAgentInfo } from 'starter/ssr/server-utils';
import { authorizedUserRequest } from 'starter/utils/auth-req-web';
import { UserEventInfo, StringIndexable } from 'starter/core/model/common.model';
import logger from './logger';

const event = async (req: Request, eventName: string, payload: StringIndexable = {}) => {
  if (!req || !eventName) return;

  const { userid, ...payloadRest } = payload || {};
  const authUser = await authorizedUserRequest(req);
  const userId = userid || authUser?.id || 'unknown';

  if (userId === 'unknown') {
    // TODO: 'unknown' userid support only for event `pageview` (to be implemented later)
    logger.error(`[ERROR] Invalid analytics trigger. event: ${eventName}`, payload);
    return;
  }

  let browserName = '';
  let osName = '';
  const userAgent = req.headers['user-agent'] || '';
  const userAgentInfo = getUserAgentInfo(userAgent);
  if (userAgentInfo) {
    const { browser, osName: os, isMobile } = userAgentInfo;
    const { name, major } = browser || {};
    browserName = `${name} ${major}`;
    osName = os || '';
    if (isMobile) osName += ' (mobile)';
  }
  const ip = `${req.headers['x-forwarded-for'] || req.socket.remoteAddress}`;

  const referer = req.get('Referrer');

  // TODO: might also send approx. location [IP Geolocation] in analytics

  let eventInfo: UserEventInfo = {
    userid: userId,
    event: eventName,
    browser: browserName,
    os: osName,
    ip,
    timestamp: new Date().toISOString(),
  };
  if (Object.keys(payloadRest).length > 0) {
    eventInfo = { ...eventInfo, payload: payloadRest };
  }
  if (referer) {
    eventInfo = { ...eventInfo, referer };
  }

  // console.log('eventInfo:', eventInfo);
  await aws.db.writeItemForce('onely_users_activity', eventInfo);
};

export default { event };
