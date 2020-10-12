import { RouteComponentProps } from 'react-router-dom';

import { AuthInfo } from 'starter/core/model/auth.model';

export interface StringIndexable<T = any> {
  [key: string]: T;
}

export interface PropsRoot extends RouteComponentProps<any> {
  authInfo: AuthInfo | null;
}
