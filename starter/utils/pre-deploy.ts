import fs from 'fs';
import path from 'path';
import http from 'http';

import awsRegions from './aws-regions';
import logger from './logger';

const writeFile = (file: string, contents: string) => {
  try {
    const pos = file.lastIndexOf('/');
    const dir = file.substring(0, pos);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, contents);
  } catch (e) {
    logger.error(`ERROR while writing to ${file}`, e);
  }
};

const fetchInstanceInfo = async () => {
  const request = (url: string) =>
    new Promise((resolve, reject) => {
      const req = http.request(url, {}, res => {
        const { statusCode } = res;
        res.on('data', dataBuffer => {
          resolve({ statusCode, data: JSON.parse(dataBuffer.toString('utf8')) });
        });
      });
      req.on('error', error => reject(error));
      req.end();
    });

  let resp: any = null;
  try {
    resp = await request('http://169.254.169.254/latest/dynamic/instance-identity/document');
  } catch (e) {} // eslint-disable-line no-empty

  if (resp?.statusCode === 200) {
    return resp?.data || null; // eslint-disable-line @typescript-eslint/no-unsafe-return
  }
  return null;
};

void (async () => {
  const instanceInfo = await fetchInstanceInfo();
  if (!instanceInfo) {
    logger.error('[ERROR] Cannot fetch instance info (pre-deploy)');
    process.exit(1);
  }

  const { region, availabilityZone } = instanceInfo || {};
  if (!region || !availabilityZone) {
    logger.error(`[ERROR] Invalid value for region/availabilityZone: [${region},${availabilityZone}]`);
    process.exit(1);
  }

  const awsRegion = awsRegions[`${region}`];
  const regionName = awsRegion?.name;
  const regionAlias = awsRegion?.alias;
  if (!regionName || !regionAlias) {
    logger.error(`[ERROR] Invalid value for regionName/regionAlias: [${regionName},${regionAlias}]`);
    process.exit(1);
  }

  const s3BucketName = process.env.BUCKET_NAME || '';
  if (!s3BucketName) {
    logger.warn(`[WARN] Missing value for BUCKET_NAME: ${s3BucketName}`);
  }

  let deployEnv = '';
  deployEnv += `INSTANCE_AVAIL_ZONE=${availabilityZone}\n`;
  deployEnv += `INSTANCE_REGION=${region}\n`;
  deployEnv += `INSTANCE_REGION_NAME=${regionName}\n`;
  deployEnv += `INSTANCE_REGION_ALIAS=${regionAlias}\n`;
  if (s3BucketName) deployEnv += `S3_BUCKET_NAME=${s3BucketName}\n`;

  const deployEnvFile = path.resolve(process.cwd(), 'starter/env/.env.deploy.tmp');
  writeFile(deployEnvFile, deployEnv);
})();
