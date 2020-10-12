import path from 'path';
import dotenv from 'dotenv';
import { fs } from '@baadal-sdk/dapi';

import { checkProd } from 'starter/utils/env';
import { envFile } from 'starter/utils/env-utils';

const isProd = checkProd();

const defaultEnvFile = path.resolve(process.cwd(), envFile('.env'));
if (fs.existsFileSync(defaultEnvFile)) {
  dotenv.config({ path: defaultEnvFile });
}

const currentEnvFileName = `.env.${isProd ? 'prod' : 'dev'}`;
const currentEnvFile = path.resolve(process.cwd(), envFile(currentEnvFileName));
if (fs.existsFileSync(currentEnvFile)) {
  dotenv.config({ path: currentEnvFile });
}

const deployEnvFile = path.resolve(process.cwd(), 'starter/env/.env.deploy.tmp');
if (fs.existsFileSync(deployEnvFile)) {
  dotenv.config({ path: deployEnvFile });
}

// used to ensure side-effect and avoid tree-sahaking
export default 'done';
