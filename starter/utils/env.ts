import prettyMilliseconds from 'pretty-ms';

export const checkProd = () => process.env.NODE_ENV === 'production';
export const checkServer = () => process.env.PLATFORM === 'server';
export const checkApiServer = () => process.env.PLATFORM === 'api';

export const checkModern = () => !checkServer() && process.env.MODERN === 'true';

// @ts-ignore
export const getBuildHash = () => (checkProd() ? `${__webpack_hash__}` : 'development');

export const elapsedBuildTime = () => {
  const buildTime = JSON.parse(process.env.BUILD_TIME || '0') * 1000;
  let elapsed = buildTime > 0 ? prettyMilliseconds(Date.now() - buildTime, { compact: true }) : '';
  if (elapsed) elapsed += ' ago';
  return elapsed;
};
