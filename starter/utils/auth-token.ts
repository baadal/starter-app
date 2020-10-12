import jwt from 'jsonwebtoken';
import short from 'short-uuid';

import { AuthUser } from 'starter/core/model/auth.model';
import logger from 'starter/utils/logger';

const tokenSecret = process.env.TOKEN_SECRET || '';
const cookieSecret = process.env.COOKIE_SECRET || '';

const authIssuer = 'auth.onely.id';

const authEnabled = tokenSecret || cookieSecret;
if (authEnabled) {
  if (!tokenSecret) {
    logger.warn('[WARN] Env variable not set: TOKEN_SECRET');
  }
  if (!cookieSecret) {
    logger.warn('[WARN] Env variable not set: COOKIE_SECRET');
  }
}

// TODO: Use public-key cryptography instead of symmetric keys
export const createRefreshToken = (user: AuthUser, expiresIn: number) => {
  if (!user) return null;

  const { keyid, refreshSecret } = user.key || {};
  if (!keyid) {
    logger.error('Missing keyid.');
    return null;
  }
  if (!refreshSecret) {
    logger.error('Missing refreshSecret.');
    return null;
  }

  const refreshToken = jwt.sign(
    {
      user: { id: user.id },
      scope: 'profile',
      nonce: short.uuid(),
    },
    refreshSecret,
    {
      expiresIn,
      issuer: authIssuer,
      audience: user.id,
      subject: user.id,
      keyid,
    }
  );

  return refreshToken;
};

export const createAccessToken = (user: AuthUser) => {
  if (!user) return null;
  if (!tokenSecret) {
    logger.error('[ERROR:createAccessToken] Missing tokenSecret:', tokenSecret);
    return null;
  }

  const expiresIn = 10 * 60; // '10m'
  const expiry = Date.now() + expiresIn * 1000;
  const tokenExpiry = Math.round(expiry / 1000);

  const accessToken = jwt.sign(
    {
      user: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
      },
      scope: 'profile',
      nonce: short.uuid(),
    },
    tokenSecret,
    {
      expiresIn,
      issuer: authIssuer,
      audience: user.id,
      subject: user.id,
    }
  );

  return { accessToken, tokenExpiry };
};

export const verifyToken = (token: string, secret: string) => {
  try {
    const payload = jwt.verify(token, secret) as jwt.JwtPayload;

    if (!payload) {
      logger.error(`[ERROR:verifyToken] Decoded payload is empty: ${payload}`);
      return null;
    }

    const iss = payload?.iss;
    const cond0 = iss === authIssuer;
    if (!cond0) {
      logger.error(`[ERROR:verifyToken] cond0 failed. (invalid issuer) iss: ${iss}`);
    }

    const exp = payload?.exp || 0;
    const now = Date.now() / 1000;
    const cond1 = typeof exp === 'number' && exp > now;
    if (!cond1) {
      logger.error(`[ERROR:verifyToken] cond1 failed. (token expired) exp: ${exp}, now: ${now}`);
    }

    if (cond0 && cond1) {
      return payload;
    }
    return null;
  } catch (err) {
    logger.error(err);
    return null;
  }
};

// ## Steps:
// 1. is token valid/untampered? (verify signature)
// 2. is token revoked/blacklisted? (access: authentication)
// 3. check permissions (scopes: authorization)
export const validateToken = (token: string, secret: string, scope = 'profile') => {
  if (!token) {
    logger.error(`[ERROR:validateToken] Missing token: ${token}`);
    return null;
  }
  if (!secret) {
    logger.error(`[ERROR:validateToken] Secret not passed.`);
    return null;
  }

  // verify refreshToken
  const payload = verifyToken(token, secret);

  if (payload) {
    // TODO: is refreshToken still valid (i.e. not revoked)? blacklist?
    // Redis/DB fetch required

    // check permissions
    const scopes: string = payload.scope || '';
    const authorized = !!scopes.split(' ').find(s => s === scope);
    if (!authorized) logger.error(`[ERROR] ${scope} access unavailable.`);

    return authorized ? payload : null;
  }

  return null;
};

export const validateAccessToken = (token: string) => {
  if (!tokenSecret) {
    logger.error('[ERROR:validateAccessToken] Missing tokenSecret:', tokenSecret);
    return null;
  }

  return validateToken(token, tokenSecret);
};

export const decodeTokenUnverified = (token: string) => {
  let decoded: jwt.Jwt | null = null;

  try {
    // NOTE: warning: unverified decode
    decoded = jwt.decode(token, { complete: true });
    if (!decoded) return null;

    const exp = decoded?.payload?.exp || 0;
    const now = Date.now() / 1000;
    const cond1 = typeof exp === 'number' && exp > now;
    if (!cond1) {
      // expired
      decoded = null;
    }
  } catch (e) {
    logger.error('Error decoding token.');
  }

  if (decoded) {
    return decoded;
  }
  return null;
};
