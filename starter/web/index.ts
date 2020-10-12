import path from 'path';
import http from 'http';
import express from 'express';
import { fs } from '@baadal-sdk/dapi';
import compression from 'compression';
import cookieParser from 'cookie-parser';

// @ts-ignore
import XMLHttpRequest from 'xhr2';
// @ts-ignore
import reload from 'reload';

import env from 'starter/const/env-values';
import { checkProd } from 'starter/utils/env';
import { reqMiddleware } from 'starter/utils/req-middleware';
import { authMiddleware } from 'starter/utils/auth-middleware';
import { initWebServer, getMimeType, isWebpagePath } from 'starter/ssr/server-utils';
import allRoutes from 'starter/ssr/all-routes';
import { COMPRESSION_FILES_REGEX } from 'starter/const/values';
import { renewToken } from 'starter/server/internal/refresh-token';
import { doLogout } from 'starter/server/internal/logout';
import logger from 'starter/utils/logger';

// support for XMLHttpRequest on node
(global as any).XMLHttpRequest = XMLHttpRequest;

const PORT = env.port;

const app = express();

const isProd = checkProd();

// hide powered by express
app.disable('x-powered-by');

// intercept request middleware
app.use(reqMiddleware());

// NOTE: Do not allow CORS requests

// disallow caching of JS/CSS bundles in dev mode
app.use((req, res, next) => {
  if (!isProd && /\.(js|css)$/i.test(req.path)) {
    // Ref: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#preventing_caching
    res.setHeader('Cache-Control', 'no-store, max-age=0');
  }
  return next();
});

// enable CORS for JS/font files
app.use((req, res, next) => {
  if (/\.(js|ttf|woff2?)$/i.test(req.path)) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  return next();
});

// static compression for static assets
if (isProd) {
  app.get(COMPRESSION_FILES_REGEX, async (req, res, next) => {
    const acceptEncoding = req.header('accept-encoding') || '';
    const filename = path.resolve(process.cwd(), `build/public${req.path}`);
    const mimeType = await getMimeType(req.path.substr(1));

    if (/\bbr\b/.test(acceptEncoding)) {
      if (fs.existsFileSync(`${filename}.br`)) {
        req.url = req.path + '.br';
        res.set('Content-Encoding', 'br');
        if (mimeType) res.set('Content-Type', mimeType);
        return next();
      }
    }
    if (/\bgzip\b/.test(acceptEncoding)) {
      if (fs.existsFileSync(`${filename}.gz`)) {
        req.url = req.path + '.gz';
        res.set('Content-Encoding', 'gzip');
        if (mimeType) res.set('Content-Type', mimeType);
        return next();
      }
    }
    return next();
  });
}

// serve static assets
app.use(express.static('build/public'));

// dynamic compression for non-static resources
if (isProd) {
  app.use(compression());
}

const cookieSecret = process.env.COOKIE_SECRET || '';
const signedCookieParser = cookieSecret ? cookieParser(cookieSecret) : cookieParser();
app.use(signedCookieParser);

// auth middleware
app.use(authMiddleware());

// disallow caching of html pages
app.use((req, res, next) => {
  const isWebpage = isWebpagePath(req.path);
  if (!isWebpage) return next();

  // Browser back/forward navigations retrieve stuff from the cache without revalidation.
  // Bug: https://bugs.chromium.org/p/chromium/issues/detail?id=516846
  // res.setHeader('Cache-Control', 'no-cache');

  // Ref: https://dev.to/jamesthomson/spas-have-your-cache-and-eat-it-too-iel
  // Ref: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#preventing_caching
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  return next();
});

app.get('/server/internal/refresh-token', renewToken);
app.get('/server/internal/logout', doLogout);

let initServer: Function;

if (fs.existsFileSync('server/routes.ts')) {
  const routes = require('server/routes'); // always exists for now, and webpack bundles all static requires anyways
  routes.serverRoutes?.(app);
  initServer = routes.initServer;

  const serverExports = Object.keys(routes);
  const serverExportsAllowed = ['serverRoutes', 'initServer'];
  serverExports.forEach(exp => {
    if (!serverExportsAllowed.includes(exp)) {
      logger.warn(`[WARN] Unexpected export \`${exp}\` from server/routes.ts`);
    }
  });
}

// create our own http server rather than using one given by express
const server = http.createServer(app);

const startServer = () => {
  server.listen(PORT, () => {
    console.log(`\nApp running at port ${PORT} 😎\n`);
    void initWebServer();
    initServer?.();

    // must be last so that Reload can set route '/reload/reload.js' by now
    allRoutes(app);
  });
};

const reloadServer = () => {
  reload(app)
    .then(() => startServer())
    .catch((error: any) => {
      console.error('[ERROR] Reload could not start server!', error);
    });
};

if (isProd) {
  startServer();
} else {
  reloadServer();
}

process.on('uncaughtException', err => {
  console.error(`[uncaughtException] Web Server:`, err);
});
