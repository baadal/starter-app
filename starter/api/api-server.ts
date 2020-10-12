import path from 'path';
import express, { Express } from 'express';
import { fs } from '@baadal-sdk/dapi';
import compression from 'compression';

// @ts-ignore
import cors from 'cors';

import { include } from 'starter/utils/node-utils';
import { reqMiddleware } from 'starter/utils/req-middleware';
import { sendResponse, sendPageResponse, allowedCrossOrigin } from 'starter/api/api-utils';
import { userAgentData } from 'starter/api/internal/user-agent';
import { initApiServer } from 'starter/api/utils/api-server-utils';
import { apiAuthMiddleware } from 'starter/api/utils/api-auth-middleware';
import env from 'starter/const/env-values';
import logger from 'starter/utils/logger';

const PORT_API = env.portApi;

let api: any = {};
{
  const apiRoutesFile = path.resolve(process.cwd(), 'api/routes.ts');
  const apiRoutesFileExists = fs.existsFileSync(apiRoutesFile);
  if (apiRoutesFileExists) {
    try {
      api = include('api/routes');

      const apiExports = Object.keys(api);
      const apiExportsAllowed = ['apiRoutes', 'initApi'];
      apiExports.forEach(exp => {
        if (!apiExportsAllowed.includes(exp)) {
          logger.warn(`[WARN] Unexpected export \`${exp}\` from api/routes.ts`);
        }
      });
    } catch (e) {
      logger.error(`[ERROR] Unexpected import error:`, e);
    }
  }
}

const defaultInfo = { info: 'starter api endpoint' };
const defaultError = { info: 'invalid api endpoint' };

const composeRouteParams = (rpath: string, orig?: string): string => {
  const i = rpath.indexOf('[');
  const j = rpath.indexOf(']');

  if (i < 0 && j < 0) {
    return rpath;
  }

  if (!orig) orig = rpath;

  if (i >= 0 && j >= 0 && j - i > 1) {
    let ppath = rpath.replace(']', '');
    if (i > 0 && ppath[i - 1] !== '/') {
      ppath = ppath.replace('[', '/:');
    } else {
      ppath = ppath.replace('[', ':');
    }
    return composeRouteParams(ppath, orig);
  }

  logger.warn(`[WARN] invalid route path found: ${orig}`);
  let xpath = rpath.replaceAll('[', '');
  xpath = xpath.replaceAll(']', '');
  return xpath;
};

const apiPageRoutes = async (app: Express) => {
  const webPages = await fs.readDirFilesRec('web/pages');
  const webPageDirs: string[] = [];
  webPages?.forEach(webPage => {
    if (webPage.endsWith('.page.tsx')) {
      const t = webPage.lastIndexOf('/');
      if (t >= 0) {
        const webPagePath = webPage.substr(0, t);
        webPageDirs.push(webPagePath);
      } else {
        logger.warn(`[WARN] web page file at unexpected location: \`web/pages/${webPage}\``);
      }
    }
  });

  const apiPages = await fs.readDirFilesRec('api/pages');
  apiPages?.forEach(apiPage => {
    const apiPageClean = apiPage.replace(/\s/g, '');
    if (apiPageClean !== apiPage) {
      logger.warn(`[WARN] file path must not contain whitespace: \`api/pages/${apiPage}\``);
      apiPage = apiPageClean;
    }

    if (apiPage.endsWith('.api.ts')) {
      const apiPageFile = `/api/pages/${apiPage}`;
      let apiPagePath = apiPageFile.substr(0, apiPageFile.lastIndexOf('/'));

      const apiPageDir = apiPagePath.substr('/api/pages/'.length);
      if (!webPageDirs.includes(apiPageDir)) {
        logger.warn(`[WARN] web page directory missing \`web/pages/${apiPageDir}\``);
      }

      apiPagePath = composeRouteParams(apiPagePath);

      const apiPageModuleFile = `api/pages/${apiPage}`;
      const apiPageModuleName = apiPageModuleFile.substr(0, apiPageModuleFile.lastIndexOf('.'));

      const apiPageModule = include(apiPageModuleName); // eslint-disable-line import/no-dynamic-require
      if (!apiPageModule.getPageData) {
        logger.warn(`[WARN] getPageData() function must be exported from \`api/pages/${apiPage}\``);
        return;
      }

      app.get(apiPagePath, (req, res) => {
        void sendResponse(req, res, apiPageModule.getPageData(req.params));
      });
    }
  });
};

const validateRoutes = (app: Express) => {
  const routes = app._router.stack;
  const len = routes.length;
  routes.every((r: any, i: number) => {
    if (r.route && r.route.path) {
      const apiRoute = `${r.route.path}`; // NOTE: interpolation is needed to stringify non-string (e.g. RegExp) routes
      if (apiRoute !== '/favicon.ico' && !apiRoute.startsWith('/api/')) {
        logger.warn(`[WARN] All api routes must start with \`/api/\`. Ignoring route: ${apiRoute}`);
        routes.splice(i, 1);
        return false;
      }
    }
    return true;
  });
  if (len !== routes.length) {
    validateRoutes(app);
  }
};

const apiCustomRoutes = async (app: Express) => {
  await api.apiRoutes?.(app);

  await apiPageRoutes(app);

  validateRoutes(app);

  app.get('/', (req, res) => sendResponse(req, res, defaultInfo));
  app.get('/*', (req, res) => {
    res.status(404);
    res.locals.status = 'error';
    void sendResponse(req, res, defaultError);
  });
};

const initServer = () => {
  initApiServer();
  api.initApi?.();
};

export const apiServer = async () => {
  const app = express();

  // hide powered by express
  app.disable('x-powered-by');

  // intercept request middleware
  app.use('/api/*', reqMiddleware());

  app.use('/api/*', cors());
  app.use('/api/*', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', allowedCrossOrigin(req));
    res.setHeader('Vary', 'Origin');
    next();
  });

  app.use('/api/*', compression());

  // app.use('/api/*', cookieParser());

  // api auth middleware
  app.use('/api/*', apiAuthMiddleware());

  // disallow caching of api requests
  app.use('/api/*', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    return next();
  });

  app.set('json spaces', 2);

  app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.resolve(process.cwd(), 'build/public/favicon.ico'));
  });

  app.get('/api/internal/page-data', (req, res) => sendPageResponse(req, res));
  app.get('/api/internal/user-agent', (req, res) => sendResponse(req, res, userAgentData(req)));

  await apiCustomRoutes(app);

  app.listen(PORT_API, () => {
    console.log(`\nAPI running at port ${PORT_API} 🎉\n`);
    initServer();
  });
};
