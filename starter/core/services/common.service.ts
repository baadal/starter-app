import Cookies from 'js-cookie';

import { setAuthInfo, getUserAuthInfo, getAuthInfo } from 'starter/utils/auth-info';
import { COOKIE_AUTH_SESSION_STATUS } from 'starter/utils/auth-cookie';
import { InitialData } from 'starter/core/model/response.model';
import { AuthInfo } from 'starter/core/model/auth.model';

export const extractInitialData = (props: any): InitialData | null => {
  const initialDataOnServer = () => props?.staticContext || null; // eslint-disable-line @typescript-eslint/no-unsafe-return

  // Ref: https://stackoverflow.com/a/7956249
  const initialDataOnClient = () => {
    if (typeof window !== typeof undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return JSON.parse(document.getElementById('__STARTER_DATA__')?.textContent || 'null');
    }
    return null;
  };

  const isServer = typeof window === typeof undefined;
  const initialData = isServer ? initialDataOnServer() : initialDataOnClient();

  return initialData; // eslint-disable-line @typescript-eslint/no-unsafe-return
};

export const extractAuthInfo = (props: any): AuthInfo | null => {
  const auth = extractInitialData(props)?.authInfo || null;
  const authInfo = getUserAuthInfo(auth);

  const currAuthSess = Cookies.get(COOKIE_AUTH_SESSION_STATUS);
  const currAuthInfo = getAuthInfo();

  const isServer = typeof window === typeof undefined;

  // Init authInfo for auth-info store (client-side)
  if (!isServer && auth && currAuthSess && !currAuthInfo) {
    void setAuthInfo(auth);
  }

  return authInfo;
};
