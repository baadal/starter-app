import { RouteComponentProps } from 'react-router-dom';

import { AuthInfo } from './auth.model';

export interface StringIndexable<T = any> {
  [key: string]: T;
}

export interface PropsRoot extends RouteComponentProps<any> {
  authInfo: AuthInfo | null;
}

export interface AppPropsRoot extends PropsRoot {
  pageData: any;
  headerData: any;
  footerData: any;
  resetInitialData: Function;
}

export interface EnvValues extends StringIndexable<string> {
  port: string;
  portApi: string;
  apiBaseUrl: string;
  apiBasePublicUrl: string;
  assetsBaseUrl: string;
}

export interface GenericRequest {
  url: string;
  path: string;
  route: { path: string };
  query?: StringIndexable<any>;
  params?: any;
  baseUrl?: string;
}

export interface AllAssetsMap {
  main: string;
  images: string[];
  css: string[];
  fonts: string[];
  compressed: string[];
  rest: string[];
}

export interface AssetsMap {
  common: string[];
  images: string[];
  fonts: string[];
}

export interface UserEventInfo {
  userid: string;
  event: string;
  payload?: StringIndexable<any>;
  browser: string;
  os: string;
  ip: string;
  referer?: string;
  timestamp: string;
}
