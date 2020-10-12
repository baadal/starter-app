import esbuild from 'esbuild';
import alias from 'esbuild-plugin-alias';
import { fs } from '@baadal-sdk/dapi';

// Ref: https://stackoverflow.com/a/63156878
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const buildJs = (path, outDir, pathStr = false) => {
  outDir = outDir.replace(/\/+$/, '');
  outDir = outDir.replace(/\/+/, '/');
  path = path.replace(/\/+/, '/');

  const sid = path.lastIndexOf('/');
  const dir = path.substr(0, sid);
  const file = path.substr(sid + 1);

  if (pathStr) outDir += `/${dir}`;
  let outfile = `${outDir}/${file}`;
  const extension = '.js'; // or '.mjs'
  outfile = outfile.substr(0, outfile.lastIndexOf('.')) + extension;

  // --------
  // Why `cjs` lib is aliased below? ('@baadal-sdk/dapi/cjs')
  // --------
  // ESM exported lib:
  // * [esbuild bug] 'cjs' output of esbuild gives error; ERR_INVALID_ARG_VALUE: 'filename' undefined
  // * 'esm' output of esbuild gives error; Dynamic require of 'x' not supported [cjs code in some dependency]
  // CJS exported lib:
  // * 'cjs' output of esbuild works fine.

  // Ref: https://github.com/evanw/esbuild/issues/1232
  // Ref: https://ar.al/2021/01/27/commonjs-to-esm-in-node.js/

  return esbuild.build({
    entryPoints: [path],
    bundle: true,
    platform: 'node',
    format: 'cjs', // or 'esm' (NOTE: 'cjs' default for platform `node`)
    target: 'node14',
    minify: true,
    outfile,
    plugins: [
      alias({
        '@baadal-sdk/dapi': require.resolve('@baadal-sdk/dapi/cjs'),
      }),
    ],
  });
};

const buildPath = 'build/api';

if (fs.existsFileSync('api/routes.ts')) {
  await buildJs('api/routes.ts', buildPath, true);
}

await buildJs('starter/api/server.ts', buildPath);

let apiPages = await fs.readDirFilesRec('api/pages');
if (apiPages) {
  apiPages = apiPages.filter(p => p.endsWith('.api.ts'));
  const pList = apiPages.map(apiPage => buildJs(`api/pages/${apiPage}`, buildPath, true));
  const rList = await Promise.allSettled(pList);

  let error = false;
  rList.forEach(result => {
    if (result.status === 'rejected') {
      error = true;
      console.error('Error during some api page build:', result.reason);
    }
  });
  if (error) {
    process.exit(1); // exit with error code
  }
}
