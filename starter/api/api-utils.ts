import { Request, Response } from 'express';
import fetch from 'node-fetch';

import env from 'starter/const/env-values';
import { getHeaderData } from 'api/common/header-data';
import { getFooterData } from 'api/common/footer-data';
import { ServerResponse } from 'starter/core/model/response.model';
import logger from 'starter/utils/logger';

// @ts-ignore
import starterConfig from '../../starter.config';

const isPromise = (p: any) => !!p && typeof p.then === 'function';

const promisify = (p: any): Promise<any> => {
  if (!isPromise(p)) {
    return Promise.resolve(p);
  }
  return p; // eslint-disable-line @typescript-eslint/no-unsafe-return
};

export const currentOrigin = (req: Request) => {
  return `${req.protocol}://${req.get('Host')}`;
};

export const allowedCrossOrigin = (req: Request) => {
  const { appBaseUrl, port, portApi } = env;

  let currentOriginHost = '';
  const currentOriginUrl = currentOrigin(req);
  if (currentOriginUrl) {
    const currentOriginUri = new URL(currentOriginUrl);
    currentOriginHost = currentOriginUri.host;
  }

  let appOrigin = '';
  if (appBaseUrl) {
    const appBaseUri = new URL(appBaseUrl);
    appOrigin = appBaseUri.origin;
  }

  let refererOrigin = '';
  const referer = req.get('Referrer');
  if (referer) {
    const refererUri = new URL(referer);
    refererOrigin = refererUri.origin;
  }

  let myappOrigin = '';
  if (currentOriginHost.includes(':')) {
    myappOrigin = currentOriginUrl.replace(`:${portApi}`, `:${port}`);
  }

  if (appOrigin && appOrigin === refererOrigin) {
    return appOrigin;
  }
  if (myappOrigin && myappOrigin === refererOrigin) {
    return myappOrigin;
  }

  return currentOriginUrl;
};

export const sendResponse = async (req: Request, res: Response, data_: any) => {
  let response: ServerResponse = { status: res.locals.status || 'ok', data: null };
  if (typeof data_ === 'function') {
    logger.warn(`[WARN] Response data must be object, not ${typeof data_}`);
  } else {
    const data = await promisify(data_);
    response = { ...response, data };
  }
  res.type('json').send(response);
};

const fetchPageData = async (req: Request) => {
  let pageData: any = null;
  const { page } = req.query;

  try {
    if (page) {
      const resp = await fetch(`http://localhost:${env.portApi}/api/pages/${page}`);
      const json = await resp.json();
      pageData = json.status === 'ok' ? json.data : null;
      if (pageData) {
        const { siteTitle } = starterConfig;
        pageData.seo = { siteTitle, ...pageData?.seo };
      }
    }
  } catch (e) {
    logger.error(e);
  }

  return pageData; // eslint-disable-line @typescript-eslint/no-unsafe-return
};

export const sendPageResponse = async (req: Request, res: Response) => {
  const instanceRegion = process.env.INSTANCE_REGION;
  const instanceRegionName = process.env.INSTANCE_REGION_NAME;

  const p1 = fetchPageData(req);
  const p2 = promisify(getHeaderData(req));
  const p3 = promisify(getFooterData(req));
  const [pageData, headerData, footerData] = await Promise.all([p1, p2, p3]);

  let response: ServerResponse = { status: 'ok', data: { pageData, headerData, footerData } };
  if (instanceRegion) {
    response = { ...response, region: `${instanceRegion}, ${instanceRegionName}` };
  }

  res.type('json').send(response);
};
