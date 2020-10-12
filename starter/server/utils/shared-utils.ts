/**
 * utils shared between web server and client (browser)
 */
import { from } from 'rxjs';

import fetch from 'starter/core/services/http-fetch';
import env from 'starter/const/env-values';
import { ServerResponse } from 'starter/core/model/response.model';
import logger from 'starter/utils/logger';

const delay = async (ms: number) =>
  new Promise<void>(resolve => {
    setTimeout(() => resolve(), ms);
  });

const fetchApiUrl = async <T = any>(url: string, options: any = {}, params: any = {}) => {
  if (!url) return null;
  let json: any = null;
  try {
    if (url.startsWith('/')) {
      url = `${env.apiBaseUrl}${url}`;
    }
    const resp = await fetch<ServerResponse<T>>(url, options, { silent: true, ...params });
    const respJson = await resp.json();
    if (respJson) {
      if (respJson.status !== 'ok') {
        throw Error(`[ERROR] Invalid fetch response. status: ${respJson.status}`);
      }
      json = respJson.data;
    }
  } catch (e) {
    logger.error(e);
  }
  return json as T;
};

export const forceFetchApiUrl = async <T = any>(url: string, options: any = {}, params: any = {}) => {
  let json: any = null;
  for (let i = 0; i < 4; i += 1) {
    json = await fetchApiUrl<T>(url, options, params); // eslint-disable-line no-await-in-loop
    if (json) {
      break;
    } else {
      await delay(1200); // eslint-disable-line no-await-in-loop
    }
  }
  if (!json) {
    logger.error(`[ERROR] Could not force fetch: ${url}`);
    return null;
  }
  return json as T;
};

export const forceFetchApiUrlObs = <T = any>(url: string, options: any = {}, params: any = {}) => {
  return from(forceFetchApiUrl<T>(url, options, params));
};
