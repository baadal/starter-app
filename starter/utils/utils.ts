import path from 'path';
import FileType from 'file-type';
import mime from 'mime-types';
import { fs } from '@baadal-sdk/dapi';

export const getStatsJson = (esm?: boolean) => {
  const statsFile = `build/loadable-stats${esm ? '.esm' : ''}.json`;
  const stats = fs.readFileSync(statsFile, true) || '{}';
  return JSON.parse(stats); // eslint-disable-line @typescript-eslint/no-unsafe-return
};

export const getAssetsJson = () => {
  const assetsFile = `build/assets-map.json`;
  const assets = fs.readFileSync(assetsFile, true) || '{}';
  return JSON.parse(assets); // eslint-disable-line @typescript-eslint/no-unsafe-return
};

export const assertStatsJson = async (esm?: boolean) => {
  const statsFile = `build/loadable-stats${esm ? '.esm' : ''}.json`;
  for (let i = 0; i < 30; i += 1) {
    if (fs.existsFileSync(statsFile)) return;
    await new Promise(resolve => setTimeout(resolve, 100)); // eslint-disable-line no-await-in-loop
  }
  throw new Error(`Stats file does not exist: ${statsFile}`);
};

export const getFileMimeType = async (filename: string) => {
  let mimeType: string | false = false;

  try {
    const fileType = await FileType.fromFile(filename);
    mimeType = fileType?.mime || false;
  } catch (e) {} // eslint-disable-line no-empty

  if (!mimeType) {
    mimeType = mime.contentType(path.extname(filename));
  }

  return mimeType;
};
