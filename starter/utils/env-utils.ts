import { fs } from '@baadal-sdk/dapi';

export const envFile = (file: string) => {
  const file1 = `env/${file}`;
  const file2 = `starter/env/${file}`;

  let filename = file2;
  if (fs.existsFileSync(file1)) {
    filename = file1;
  }

  return filename;
};

export const commonFile = (file: string) => {
  const file1 = `web/common/${file}`;
  const file2 = `starter/web/common/${file}`;

  let filename = file2;
  if (fs.existsFileSync(file1)) {
    filename = file1;
  }

  return filename;
};
