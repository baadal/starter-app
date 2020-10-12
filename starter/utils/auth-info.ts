import { BehaviorSubject } from 'rxjs';
import jwtDecode from 'jwt-decode'; // or jwt.decode (jsonwebtoken) on server

import logger from 'starter/utils/logger';
import { AuthInfo, AuthUser } from 'starter/core/model/auth.model';
import { sendMessage, AuthEvent, channelInfo } from './auth-channel';

export const authInfo$ = new BehaviorSubject<AuthInfo | null>(null);

let timeoutId: NodeJS.Timeout;

export const getUserAuthInfo = (auth: AuthInfo | null) => {
  let userAuthInfo: AuthInfo | null = null;
  const token = auth?.token || '';
  const tokenExpiry = auth?.token_expiry || 0;
  if (token && tokenExpiry) {
    try {
      // NOTE: warning: unverified decode
      const decoded = jwtDecode(token) as any;
      const user: AuthUser = decoded.user || {};
      userAuthInfo = { user, token, token_expiry: tokenExpiry };
    } catch (e) {
      logger.error('Error decoding accessToken. Login/tokenRefresh failed!');
    }
  }
  return userAuthInfo;
};

const setRenewalTimer = (t: number) => {
  if (channelInfo.elector?.isLeader && !channelInfo.elector?.isDead) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(renewAccessToken, t); // eslint-disable-line @typescript-eslint/no-use-before-define
  }
};

const setupRenewalTimer = (t: number) => {
  const waitStart = Date.now();

  channelInfo.elector?.awaitLeadership().then(() => {
    const waitTime = Date.now() - waitStart;
    if (waitTime > 5000) t = 0;
    setRenewalTimer(t);
  });

  // TODO: Handle duplicate leaders!
  // Ref: https://github.com/pubkey/broadcast-channel/issues/414
  // However, it's not a big issue if multiple tabs are refreshing access token and broadcasting..
  if (channelInfo.elector) {
    channelInfo.elector.onduplicate = (info: any) => {
      logger.warn('[WARN] Unhandled/untested situation: duplicate leaders!', info);
    };
  }
};

export const renewAccessToken = async () => {
  let auth: any = null;
  try {
    // Note that there is no need to pass authorization header to /refresh-token endpoint
    const resp = await fetch('/server/internal/refresh-token');
    const json = await resp.json();
    if (json?.status === 'ok') {
      auth = json?.data || null;
      if (auth) {
        await setAuthInfo(auth, { refresh: true }); // eslint-disable-line @typescript-eslint/no-use-before-define
      }
    }
  } catch (e) {
    // Rather, handled at appHeartbeat/diagnoseApp
    // setRenewalTimer(1000);
  }
  return auth; // eslint-disable-line @typescript-eslint/no-unsafe-return
};

const setupTokenRefresh = (expiry: number | undefined, tokenRefresh: boolean) => {
  if (!expiry) return;

  const diff = expiry * 1000 - Date.now();
  const rand = Math.floor(Math.random() * 1000) / 100; // [0, 10)
  const wait = Math.max(diff - (10 + rand) * 1000, 0);

  if (!tokenRefresh) {
    setupRenewalTimer(wait);
  } else {
    setRenewalTimer(wait);
  }
};

const doLogin = (auth: any, tokenRefresh = false) => {
  const userAuthInfo = getUserAuthInfo(auth);
  if (userAuthInfo) {
    authInfo$.next(userAuthInfo);
    setupTokenRefresh(userAuthInfo.token_expiry, tokenRefresh);
  }
};

const doLogout = async (localOnly = false) => {
  try {
    if (localOnly) {
      authInfo$.next(null);
      if (timeoutId) clearTimeout(timeoutId);
    } else {
      const resp = await fetch('/server/internal/logout');
      const json = await resp.json();
      if (json?.status === 'ok') {
        authInfo$.next(null);
        if (timeoutId) clearTimeout(timeoutId);
      }
    }
  } catch (e) {
    // TODO: In case of network unavailability show proper popup message to user.
    logger.error('Error at logout endpoint. Logout failed!');
    return false; // logout failure
  }

  return true; // logout success
};

// NOTE: On event, called on all contexts (tabs, windows, iframes, etc.)
// NOTE: Emitted event is received by all tabs, **except** the emitting tab/window
export const authSessionHandler = (msg: AuthEvent) => {
  if (!msg) return;

  const isSource = msg.source === channelInfo.id;
  if (isSource) {
    // Ref: https://developers.google.com/web/updates/2016/09/broadcastchannel#sending_messages
    logger.warn('[Unexpected] Please check BroadcastChannel instances created.');
    return;
  }

  if (msg.event === 'logout') {
    if (authInfo$.value) void doLogout(true);
  } else if (msg.event === 'login') {
    if (!authInfo$.value) doLogin(msg.data);
  } else if (msg.event === 'token_refresh') {
    doLogin(msg.data, true);
  } else {
    logger.error(`Invalid msg.event: ${msg.event}`);
  }
};

export const setAuthInfo = async (auth: any, options?: AuthInfoOptions) => {
  const isServer = typeof window === typeof undefined;
  if (isServer) return;

  const refresh = options?.refresh || false;

  // NOTE: Send event to all contexts (tabs, windows, iframes, etc.)
  if (auth) {
    doLogin(auth, refresh);
    const event = refresh ? 'token_refresh' : 'login';
    sendMessage({ event, data: auth });
  } else {
    const loggedOut = await doLogout();
    if (loggedOut) {
      sendMessage({ event: 'logout' });
    }
  }
};

export const getAuthInfo = () => {
  return authInfo$.value;
};

export type AuthInfoOptions = {
  refresh?: boolean;
};
