import { checkProd, checkServer, checkApiServer } from 'starter/utils/env';
import { EnvValues } from 'starter/core/model/common.model';
import { DEFAULT_PORT, DEFAULT_PORT_API } from './values';

const values: EnvValues = {
  port: process.env.PORT || DEFAULT_PORT,
  portApi: process.env.PORT_API || DEFAULT_PORT_API,
  appBaseUrl: process.env.APP_BASE_URL || '',
  apiBaseUrl: process.env.API_BASE_URL || '',
  apiBasePublicUrl: process.env.API_BASE_URL || '',
  assetsBaseUrl: process.env.ASSETS_BASE_URL || '',
};

const isProd = checkProd();
const isServer = checkServer();
const isApiServer = checkApiServer();

if (!values.apiBaseUrl) {
  if (typeof window !== 'undefined' && window.location.origin.includes(values.port)) {
    values.apiBaseUrl = window.location.origin.replace(values.port, values.portApi);
  } else {
    values.apiBaseUrl = `http://localhost:${values.portApi}`;
  }
}
values.apiBasePublicUrl = values.apiBaseUrl;

if (isProd && (isServer || isApiServer)) {
  values.apiBaseUrl = `http://localhost:${values.portApi}`;
}

export default values;
