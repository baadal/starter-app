import { aws } from '@baadal-sdk/dapi';
import { Request } from 'express';
import short from 'short-uuid';

import analytics from 'starter/utils/analytics';
import { UserIdentity, UserInfo, AuthUser } from 'starter/core/model/auth.model';
import { StringIndexable } from 'starter/core/model/common.model';
import logger from 'starter/utils/logger';

export const assertAuthUser = async (req: Request, identity: UserIdentity): Promise<AuthUser | null> => {
  let fetchedUser: UserInfo | null = null;
  const timestamp = new Date().toISOString();

  const identityInfo = await aws.db.readItem<UserIdentity>('onely_users_identity', { id: identity.id });
  if (!identityInfo) {
    // TODO: newUser.name might be a shorter version of identity.name [displayName]
    let newUser: UserInfo = {
      id: short.uuid(),
      name: identity.name,
      email: identity.email,
      // admin: false,
      keys: [
        {
          keyid: short.uuid(),
          refreshSecret: `${short.generate()}${short.generate()}`,
        },
      ],
      created: timestamp,
      updated: timestamp,
      lastlogin: timestamp,
    };
    if (identity.picture) {
      newUser = { ...newUser, avatar: identity.picture };
    }

    const newUserCreated = await aws.db.writeItemForce<UserInfo>('onely_users', newUser);
    if (!newUserCreated) {
      logger.error(`[ERROR] Could not create new user! newUser:`, newUser);
      return null;
    }

    identity = { ...identity, userid: newUserCreated.id, created: timestamp, updated: timestamp, lastlogin: timestamp };
    const identityCreated = await aws.db.writeItem('onely_users_identity', identity);
    if (!identityCreated) {
      logger.error(`[Unexpected ERROR] User created, but identity not created! identity:`, identity);
      return null;
    }

    fetchedUser = newUserCreated;
    fetchedUser = { ...fetchedUser, newUser: true };
  } else {
    const userid = identityInfo.userid || '';
    if (!userid) {
      logger.error(`[Unexpected ERROR] userid missing in identity! identity:`, identityInfo);
      return null;
    }

    let update = 'set';
    const attr: StringIndexable = {};
    const attrNames: StringIndexable = {};
    let nextAttr = 'a';
    let identityMatch = true;

    identity = { ...identity, userid };
    Object.entries(identity).forEach(([key, value]) => {
      const match = (identityInfo as any)[key] === value;
      if (!match) {
        update += ` #${nextAttr} = :${nextAttr},`;
        attr[`:${nextAttr}`] = value;
        attrNames[`#${nextAttr}`] = key;
        nextAttr = String.fromCharCode(nextAttr.charCodeAt(0) + 1);
      }
      identityMatch = identityMatch && match;
    });
    if (!identityMatch) {
      if (identity.id === identityInfo.id && identity.userid === identityInfo.userid) {
        update += ` #${nextAttr} = :${nextAttr}`;
        attr[`:${nextAttr}`] = timestamp;
        attrNames[`#${nextAttr}`] = 'updated';
        nextAttr = String.fromCharCode(nextAttr.charCodeAt(0) + 1);

        const identityUpdated = await aws.db.updateItem('onely_users_identity', { id: identity.id }, update, attr, attrNames);
        if (!identityUpdated) {
          const msg1 = `update: ${JSON.stringify(update)}`;
          const msg2 = `attr: ${JSON.stringify(attr)}`;
          const msg3 = `attrNames: ${JSON.stringify(attrNames)}`;
          logger.error(`ERROR] Error while updating user identity. ${msg1}, ${msg2}, ${msg3}`);
          return null;
        }

        // TODO: user update might be required after identity update
      } else {
        logger.error(`[Unexpected ERROR] Unexpected mismatch of identity id or userid:`, identity, identityInfo);
        return null;
      }
    }

    const updateLast = `set #a = :a`;
    const attrLast = { ':a': timestamp };
    const attrNamesLast = { '#a': 'lastlogin' };

    const p1 = aws.db.updateItem('onely_users', { id: userid }, updateLast, attrLast, attrNamesLast);
    const p2 = aws.db.updateItem('onely_users_identity', { id: identity.id }, updateLast, attrLast, attrNamesLast);
    const [upd1, upd2] = await Promise.all([p1, p2]);
    if (!upd1 || !upd2) {
      logger.error(`[Unexpected ERROR] Error while updating users or users_identity: upd1: ${upd1}, upd2: ${upd2}`);
      return null;
    }

    fetchedUser = await aws.db.readItem<UserInfo>('onely_users', { id: userid });
    if (!fetchedUser) {
      logger.error(`[Unexpected ERROR] identity exists but user missing:`, fetchedUser);
      return null;
    }
  }

  // send analytics event for successful signup/login
  const event = fetchedUser.newUser ? 'signup' : 'login';
  await analytics.event(req, event, { userid: fetchedUser.id, identity: identity.id });

  let authUser: AuthUser = {
    id: fetchedUser.id,
    name: fetchedUser.name,
    // admin?: boolean;
    key: fetchedUser.keys[fetchedUser.keys.length - 1],
  };
  if (fetchedUser.avatar) {
    authUser = { ...authUser, avatar: fetchedUser.avatar };
  }
  if (fetchedUser.newUser) {
    authUser = { ...authUser, newUser: fetchedUser.newUser };
  }

  return authUser;
};

export const fetchAuthUser = async (userid: string, keyid: string): Promise<AuthUser | null> => {
  if (!userid || !keyid) {
    logger.error(`[ERROR:fetchAuthUser] Invalid args! userid: ${userid}, keyid: ${keyid}`);
    return null;
  }

  const userInfo = await aws.db.readItem<UserInfo>('onely_users', { id: userid });
  if (!userInfo) {
    logger.error(`[ERROR:fetchAuthUser] Error fetching user! userid: ${userid}`);
    return null;
  }

  const activeKey = userInfo.keys[userInfo.keys.length - 1];
  let authUser: AuthUser = {
    id: userInfo.id,
    name: userInfo.name,
    // admin?: boolean;
    key: activeKey,
  };
  if (userInfo.avatar) authUser = { ...authUser, avatar: userInfo.avatar };

  return authUser;
};
