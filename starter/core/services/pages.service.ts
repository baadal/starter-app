import { of, forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';

// import HttpClient from 'starter/core/services/http-client';
import { forceFetchApiUrlObs } from 'starter/server/utils/shared-utils';
import { getAuthInfo } from 'starter/utils/auth-info';
import { findRoute } from 'starter/core/routes/routes-provider';
import env from 'starter/const/env-values';
import { GenericRequest } from 'starter/core/model/common.model';
import { InitialData } from 'starter/core/model/response.model';
import logger from 'starter/utils/logger';

const getSourceData = <T = any>(req: GenericRequest | null, res?: Response) => {
  const path = req?.path || '';
  const route = findRoute(path);

  if (!path || !path.startsWith('/')) {
    logger.error(`[Unexpected error] path: ${path}`);
    return of(null);
  }

  if (!route) {
    logger.error(`[Unexpected error] route: ${route}`);
    return of(null);
  }

  let page = path.substr(1);
  if (page === '') {
    page = 'home';
  } else if (route?.name === 'not-found') {
    page = 'not-found';
    if (res) {
      res.locals.notFound = true;
    }
  }

  if (env.apiBaseUrl) {
    let params = {};
    const isServer = typeof window === typeof undefined;
    const authInfo = isServer ? res?.locals.authInfo : getAuthInfo();
    if (authInfo) params = { token: authInfo.token, token_expiry: authInfo.token_expiry };

    const url = `${env.apiBaseUrl}/api/internal/page-data?page=${page}`;
    // return HttpClient.get<InitialData<T>>(url, {}, params);
    return forceFetchApiUrlObs<InitialData<T>>(url, {}, params);
  }

  return of(null);
};

export const getInitialData = <T = any>(req: GenericRequest | null, res?: Response): Observable<InitialData<T> | null> => {
  return forkJoin([getSourceData<T>(req, res)]).pipe(
    map(result => {
      const pageResult = result[0] as InitialData<T>;
      let initialData: InitialData<T> = {
        pageData: pageResult?.pageData ?? null,
        headerData: pageResult?.headerData ?? null,
        footerData: pageResult?.footerData ?? null,
      };
      const authInfo = res?.locals.authInfo;
      if (authInfo) {
        initialData = {
          ...initialData,
          authInfo: { token: authInfo.token, token_expiry: authInfo.token_expiry },
        };
      }
      return initialData;
    })
  );
};
