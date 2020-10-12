import path from 'path';
import UAParser from 'ua-parser-js';
import { fs, aws } from '@baadal-sdk/dapi';

import { checkProd } from 'starter/utils/env';
import browserMap from 'starter/ssr/browser-map';
import {
  uaParserMap,
  assetsDataMap,
  assetsMimeMap,
  cjsStatsCache,
  esmStatsCache,
  etcStatsCache,
  cjsToEsmMap,
} from 'starter/ssr/server-state';
import { assertStatsJson, getStatsJson, getAssetsJson, getFileMimeType } from 'starter/utils/utils';
import { AssetsMap, StringIndexable } from 'starter/core/model/common.model';
import { DomElem, BrowserInfo, UserAgentInfo } from 'starter/core/model/ssr.model';
import logger from 'starter/utils/logger';

const isProd = checkProd();

export const getPublicPath = () => {
  return (cjsStatsCache.get('publicPath') as string) || '/';
};

const publicParts = (url: string) => {
  const publicPath = getPublicPath();
  if (!url?.startsWith(publicPath)) {
    return null;
  }

  const pubPath = publicPath;
  const urlPath = url.substr(publicPath.length);
  return { pubPath, urlPath };
};

export const initUaParserMap = () => {
  Object.entries(browserMap).forEach(([key, value]) => {
    const uaparsedValues: string[] = [value.uaparse].flat();
    uaparsedValues.forEach(uaparse => {
      let uaparseKey = uaparse;
      if (value.cond) {
        if (value.cond.android) uaparseKey += ':android';
        else uaparseKey += ':!android';
      }
      uaparseKey = uaparseKey.toLowerCase().split(' ').join('-');
      uaParserMap.set(uaparseKey, key);
    });
  });
};

const initStatsCache = (esm?: boolean) => {
  const statsCache = esm ? esmStatsCache : cjsStatsCache;
  const statsJson = getStatsJson(esm);
  const assetsJson = getAssetsJson();

  const assetsByChunkName = statsJson.assetsByChunkName || {};
  statsCache.set('assetsByChunkName', assetsByChunkName);

  const publicPath = statsJson.publicPath || '/';
  statsCache.set('publicPath', publicPath);

  const assetsMap: AssetsMap = {
    common: ['scriptTop.js', 'scriptBottom.js'],
    images: assetsJson.images || [],
    fonts: assetsJson.fonts || [],
  };
  etcStatsCache.set('assetsMap', assetsMap);
};

const filterJsMap = (jsMap: StringIndexable<string | string[]>) => {
  const jsMapFilter: StringIndexable<string> = {};
  if (!jsMap) return jsMapFilter;

  Object.entries(jsMap).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value = value.find(file => /\.js$/.test(file)) || '';
    }
    jsMapFilter[`${key}`] = value;
  });

  return jsMapFilter;
};

const initCjsToEsmMap = () => {
  if (!cjsStatsCache.size) {
    logger.error('[initCjsToEsmMap] cjsStatsCache NOT initialized yet!');
  }
  if (!esmStatsCache.size) {
    logger.error('[initCjsToEsmMap] esmStatsCache NOT initialized yet!');
  }

  const cjsFiles = filterJsMap(cjsStatsCache.get('assetsByChunkName'));
  const esmFiles = filterJsMap(esmStatsCache.get('assetsByChunkName'));

  Object.keys(cjsFiles).forEach(key => {
    const cjsFile = cjsFiles[`${key}`];
    if (cjsFile && !cjsToEsmMap.has(cjsFile)) {
      cjsToEsmMap.set(cjsFile, esmFiles[`${key}`]);
    }
  });
};

const getAssetNames = (esm?: boolean) => {
  const statsCache = esm ? esmStatsCache : cjsStatsCache;
  const assetList = Object.values(statsCache.get('assetsByChunkName') || {}).flat() as string[];
  return assetList;
};

export const getAssetList = (esm?: boolean) => {
  const statsCache = esm ? esmStatsCache : cjsStatsCache;
  const assetList = getAssetNames(esm);
  const publicPath = statsCache.get('publicPath');
  return assetList.map(asset => `${publicPath}${asset}`);
};

const initAssetsDataMap = (esm?: boolean) => {
  const assetList = getAssetNames(esm);
  const styleAssetList = assetList.filter(assetName => /\.css$/.test(assetName));

  const assetsMap: AssetsMap = etcStatsCache.get('assetsMap') || {};
  const jsAssetList = assetsMap.common;

  const dataAssetList = [...styleAssetList, ...jsAssetList];
  dataAssetList.forEach((assetName: string) => {
    if (!assetsDataMap.has(assetName)) {
      const assetFile = `build/public/${assetName}`;
      const assetData = fs.readFileSync(assetFile) || '';
      assetsDataMap.set(assetName, assetData);
    }
  });
};

const cacheMimeType = async (assetName: string) => {
  if (assetsMimeMap.has(assetName)) {
    const mime = assetsMimeMap.get(assetName) || '';
    if (mime) return mime;
  }

  const filename = path.resolve(process.cwd(), `build/public/${assetName}`);
  const mimeType = await getFileMimeType(filename);
  if (mimeType) {
    assetsMimeMap.set(assetName, mimeType);
    return mimeType;
  }
  return '';
};

const initAssetsMimeMap = async (esm?: boolean) => {
  const statsJson = getStatsJson(esm);
  const assets = Object.values(statsJson.assetsByChunkName || {}).flat();

  const assetsJson = getAssetsJson();
  const assetNames = [...assets, ...assetsJson.images, ...assetsJson.fonts] as string[];

  const prList: Promise<string>[] = [];
  assetNames.forEach(assetName => prList.push(cacheMimeType(assetName)));
  await Promise.all(prList);
};

export const initWebServer = async () => {
  try {
    const region = process.env.AWS_REGION || '';
    if (region) aws.init(region);

    await assertStatsJson();
    initUaParserMap();
    initStatsCache();
    initAssetsDataMap();
    await initAssetsMimeMap();
    if (isProd) {
      await assertStatsJson(true);
      initStatsCache(true);
      initAssetsDataMap(true);
      await initAssetsMimeMap(true);
      initCjsToEsmMap();
    }
  } catch (e) {
    logger.warn('~~~~~~~~~~~~~~~~~~~');
    logger.error(e.message);
    logger.warn('~~~~~~~~~~~~~~~~~~~');
  }
};

export const getAssetsData = (assetPath: string) => {
  if (!assetsDataMap.size) {
    logger.error('[getAssetsData] assetsDataMap NOT initialized yet!');
    return '';
  }

  let urlPath = assetPath;
  if (assetPath.startsWith('/') || /^https?:/.test(assetPath)) {
    const parts = publicParts(assetPath);
    if (!parts) {
      logger.error(`[getAssetsData] Unexpected url: ${assetPath}`);
      return '';
    }
    urlPath = parts.urlPath;
  }

  return assetsDataMap.get(urlPath) || '';
};

export const getFontList = () => {
  const assetsMap: AssetsMap = etcStatsCache.get('assetsMap') || {};
  return assetsMap.fonts || [];
};

const getCaniuseName = (uaParseName: string, android?: boolean) => {
  let label = '';
  if (!uaParserMap.size) {
    logger.error('[getCaniuseName] uaParserMap NOT initialized yet!');
    return label;
  }

  if (uaParseName) {
    let uaparseKey = uaParseName.toLowerCase().split(' ').join('-');
    if (!uaParserMap.has(uaparseKey)) {
      uaparseKey = android ? `${uaparseKey}:android` : `${uaparseKey}:!android`;
    }
    if (uaParserMap.has(uaparseKey)) {
      const browserMapKey = uaParserMap.get(uaparseKey);
      const { caniuse } = browserMap[`${browserMapKey}`];
      label = [caniuse].flat()[0] as string;
    }
  }

  if (!label) {
    logger.warn('[getCaniuseName] Browser label NOT defined!');
  }
  return label;
};

export const getUserAgentInfo = (userAgent: string): UserAgentInfo | null => {
  if (!userAgent) return null;

  const parser = new UAParser(userAgent);

  let browser: BrowserInfo = parser.getBrowser();
  const device = parser.getDevice();
  const os = parser.getOS();

  const osName = os.name || '';
  const deviceType = device.type?.toLowerCase() || '';
  const isMobile = deviceType.includes('mobile') || deviceType.includes('tablet');
  const android = isMobile && osName.toLowerCase() === 'android';

  const browserName = browser?.name || '';
  const label = getCaniuseName(browserName, android);
  browser = { ...browser, label };

  return { browser, osName, isMobile };
};

export const getMimeType = async (urlPath: string) => {
  let mimeType: string | boolean = false;
  if (!assetsMimeMap.size) {
    logger.error('[getMimeType] assetsMimeMap NOT initialized yet!');
    return mimeType;
  }

  if (urlPath) {
    if (assetsMimeMap.has(urlPath)) {
      mimeType = assetsMimeMap.get(urlPath) || false;
    } else {
      logger.warn(`[getMimeType] mimeType missing in assetsMimeMap for asset: ${urlPath}`);
      mimeType = (await cacheMimeType(urlPath)) || false;
    }
  }

  if (!mimeType) {
    logger.error(`[getMimeType] mimeType NOT found for asset: ${urlPath}`);
  }
  return mimeType;
};

export const injectEsmScripts = (elems: DomElem[], esmSupported: boolean) => {
  if (!esmSupported) {
    return elems;
  }
  if (!cjsToEsmMap.size) {
    logger.error('[injectEsmScripts] cjsToEsmMap NOT initialized yet!');
    return elems;
  }

  const elemsIn: DomElem[] = [];
  elems.forEach(el => {
    if (/\.js$/.test(el.props.src)) {
      const cjsUrl = el.props.src as string;
      const parts = publicParts(cjsUrl);
      if (!parts) {
        logger.error(`[injectEsmScripts] Unexpected url: ${cjsUrl}`);
        elemsIn.push(el);
        return;
      }

      const { pubPath, urlPath } = parts;
      const newUrlPath = cjsToEsmMap.get(urlPath);
      if (!newUrlPath) {
        logger.error(`[injectEsmScripts] No value in cjsToEsmMap for: ${urlPath}`);
        elemsIn.push(el);
        return;
      }

      const esmEl: DomElem = JSON.parse(JSON.stringify(el));
      esmEl.props.src = `${pubPath}${newUrlPath}`;
      esmEl.props = { type: 'module', ...esmEl.props, crossorigin: 'anonymous' };
      // if (esmEl.props.async) delete esmEl.props.async; // delete async attr
      elemsIn.push(esmEl);

      const elOrig: DomElem = JSON.parse(JSON.stringify(el));
      elOrig.props = { nomodule: true, ...elOrig.props }; // nomodule
      elemsIn.push(elOrig);
    } else {
      elemsIn.push(el);
    }
  });

  return elemsIn;
};

export const swapEsmLinks = (elems: DomElem[], esmSupported: boolean) => {
  if (!esmSupported) {
    return elems;
  }
  if (!cjsToEsmMap.size) {
    logger.error('[swapEsmLinks] cjsToEsmMap NOT initialized yet!');
    return elems;
  }

  const elemsIn: DomElem[] = [];
  elems.forEach(el => {
    if (/\.js$/.test(el.props.href)) {
      const cjsUrl = el.props.href as string;
      const parts = publicParts(cjsUrl);
      if (!parts) {
        logger.error(`[swapEsmLinks] Unexpected url: ${cjsUrl}`);
        elemsIn.push(el);
        return;
      }

      const { pubPath, urlPath } = parts;
      const newUrlPath = cjsToEsmMap.get(urlPath);
      if (!newUrlPath) {
        logger.error(`[swapEsmLinks] No value in cjsToEsmMap for: ${urlPath}`);
        elemsIn.push(el);
        return;
      }

      const esmEl: DomElem = JSON.parse(JSON.stringify(el));
      esmEl.props.href = `${pubPath}${newUrlPath}`;
      if (esmEl.props.rel === 'preload' && /\.esm\.js$/.test(esmEl.props.href)) {
        // Ref: https://developers.google.com/web/updates/2017/12/modulepreload
        esmEl.props.crossorigin = 'anonymous';

        // Ref: https://developers.google.com/web/updates/2017/12/modulepreload
        esmEl.props.rel = 'modulepreload';
      }

      elemsIn.push(esmEl);
    } else {
      elemsIn.push(el);
    }
  });

  return elemsIn;
};

export const isWebpagePath = (reqPath: string) => {
  return !reqPath.endsWith('.js');
};
