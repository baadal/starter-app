import { AuthInfo } from 'starter/core/model/auth.model';

export interface InitialData<T = any> {
  pageData?: T | null;
  headerData?: any;
  footerData?: any;
  authInfo?: AuthInfo | null;
}

export interface StarterInfo {
  version: string;
  build_hash: string;
  build_time: string;
  timestamp: string;
  path: string;
  query: any;
}

export interface ServerResponse<T = any> {
  status: 'ok' | 'error';
  errorCode?: number;
  errorMsg?: string;
  data: T;
  region?: string;
}
