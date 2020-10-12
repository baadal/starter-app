import logger from 'starter/utils/logger';

// npm i -D tsconfig-paths
// ts-node -r tsconfig-paths/register ./starter/api/server.ts

export const existsModule = (path: string) => {
  let exists = true;
  try {
    require.resolve(path);
  } catch (e) {
    exists = false;
  }
  return exists;
};

export const include = (path: string) => {
  if (!existsModule(path)) {
    // modules compiled to JS in build/.. folder
    path = './' + path;
  }
  return require(path); // eslint-disable-line import/no-dynamic-require, @typescript-eslint/no-unsafe-return
};

export const commonModule = (file: string) => {
  const file1 = `api/common/${file}`;
  const file2 = `starter/api/common/${file}`;

  let module;
  try {
    if (existsModule(file1)) {
      module = require(file1); // eslint-disable-line import/no-dynamic-require
    } else {
      module = require(file2); // eslint-disable-line import/no-dynamic-require
    }
  } catch (e) {
    logger.error(e);
    module = null;
  }

  return module; // eslint-disable-line @typescript-eslint/no-unsafe-return
};
