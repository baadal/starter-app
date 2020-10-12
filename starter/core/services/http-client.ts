import { of, from } from 'rxjs';
import { map, timeout, catchError, switchMapTo } from 'rxjs/operators';
import { ajax, AjaxResponse, AjaxError, AjaxConfig } from 'rxjs/ajax';

import { ServerResponse } from 'starter/core/model/response.model';
import { renewAccessToken } from 'starter/utils/auth-info';
import logger from 'starter/utils/logger';
import { AJAX_TIMEOUT } from 'starter/const/values';

// TODO: Test whether it is still needed with the new xhr library..
const xhr = typeof XMLHttpRequest !== 'undefined' ? new XMLHttpRequest() : null;
let responseTypeDefault: XMLHttpRequestResponseType = 'json';
if (xhr) {
  xhr.open('GET', '/', true);
  try {
    xhr.responseType = 'json';
  } catch (e) {
    logger.log('Exception while setting xhr.responseType to json');
  }
  if (!xhr.responseType) {
    responseTypeDefault = 'text';
    logger.log('Switching default responseType to text');
  }
  xhr.abort();
}

class HttpClient {
  static get<T = any>(url: string, options: any = {}, params: any = {}) {
    options.method = 'GET';
    return this.sendRequest<T>(url, options, params);
  }

  static post<T = any>(url: string, options: any = {}, params: any = {}) {
    options.method = 'POST';
    return this.sendRequest<T>(url, options, params);
  }

  private static sendRequest<T>(url: string, optionsX: any = {}, params: any = {}) {
    if (!url) {
      logger.error('[Ajax Error] Missing URL:', url);
      return of(null);
    }

    const options: Options = { url, ...optionsX }; // setUrl
    // this.setQueryString(options);
    const optionsObs$ = from(this.setDefaultOptions(options, params));

    // Ref: https://www.learnrxjs.io/learn-rxjs/operators/transformation/switchmap
    // Ref: https://www.learnrxjs.io/learn-rxjs/operators/transformation/mergemap
    return optionsObs$.pipe(
      switchMapTo(
        ajax(options).pipe(
          timeout(AJAX_TIMEOUT),
          map(resp => this.handleServerResponse<T>(resp, options, params)),
          catchError(err => this.handleErrorResponse(err, options, params))
        )
      )
    );
  }

  private static async setDefaultOptions(options: Options, params: any) {
    options.createXHR = () => new XMLHttpRequest();
    options.crossDomain = true;
    options.responseType = responseTypeDefault;
    // options.timeout = 4000;

    let { token, token_expiry: expiry } = params || {};

    if (token) {
      let now = Date.now() / 1000;
      let tokenNotExpired = typeof expiry === 'number' && expiry > now;

      const isServer = typeof window === typeof undefined;

      // token expired! (though unexpected since `silent refresh` should have handled it)
      if (!tokenNotExpired) {
        if (!isServer) {
          logger.warn(`[WARN] Silent refresh failure! Expired token found. exp: ${expiry}`);
          const auth = await renewAccessToken();
          if (auth?.token && auth?.token_expiry) {
            token = auth.token;
            expiry = auth.token_expiry;
            now = Date.now() / 1000;
            tokenNotExpired = typeof expiry === 'number' && expiry > now;
          } else {
            logger.error(`[ERROR] accessToken refresh retry failed! exp: ${auth?.token_expiry}`);
          }
        } else {
          logger.warn(`[WARN] Expired token found. exp: ${expiry}`);
        }
      }

      if (tokenNotExpired) {
        // JWT base-64 alphabet is url-safe, so token need not be urlencoded
        // Ref: https://stackoverflow.com/a/60206016
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }
  }

  private static parseServerResponse<T>(resp: AjaxResponse<any>, responseType: string) {
    let response: ServerResponse<T> | null = null;

    try {
      switch (responseType) {
        case 'json':
          response = typeof resp.response === 'object' ? resp.response : JSON.parse(resp.response || 'null');
          break;
        case 'text':
          response = JSON.parse(resp.response || 'null');
          break;
        default:
          logger.error(`Invalid responseType: ${responseType}`);
          break;
      }
    } catch (e) {
      logger.error(`Unable to parse response: ${resp.response}`);
    }

    return response;
  }

  private static handleServerResponse<T>(resp: AjaxResponse<any>, options: Options, params: any) {
    const responseType = resp.responseType || options.responseType || responseTypeDefault;
    const response = this.parseServerResponse<T>(resp, responseType);

    if (!response) {
      const err: Error = {
        name: 'server-response-null',
        message: `Server response was returned as null`,
      };
      this.handleErrorResponse(err, options, params);
      return null;
    }

    if (params?.raw) {
      return response;
    }

    if (response.status !== 'ok') {
      const err: Error = {
        name: 'server-error',
        message: `Server error with error code ${response.errorCode} and error message: ${response.errorMsg}`,
      };
      this.handleErrorResponse(err, options, params);
      return null;
    }
    return response.data;
  }

  private static handleErrorResponse(err: AjaxError | Error, options: Options, params: any) {
    delete options.headers; // Remove headers before logging for security reasons
    if (!params?.silent) {
      logger.error('[Ajax Error]', err, '\n', options);
    }
    return of(null);
  }
}

export default HttpClient;

export interface Options extends AjaxConfig {}
