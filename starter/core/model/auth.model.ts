export interface AuthInfo {
  user?: AuthUser;
  token: string;
  token_expiry: number;
}

export interface UserIdentity {
  id: string;
  email: string;
  name: string;
  picture?: string;
  userid?: string;
  created?: string;
  updated?: string;
  lastlogin?: string;
}

interface SecretKey {
  keyid: string;
  refreshSecret: string;
}

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  admin?: boolean;
  keys: SecretKey[];
  created?: string;
  updated?: string;
  lastlogin?: string;
  newUser?: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  avatar?: string;
  admin?: boolean;
  key?: SecretKey;
  newUser?: boolean;
}
