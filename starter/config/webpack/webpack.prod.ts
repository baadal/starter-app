import path from 'path';
import { WebpackPluginInstance } from 'webpack';
import Dotenv from 'dotenv-webpack';
import { fs } from '@baadal-sdk/dapi';

// @ts-ignore
import CompressionPlugin from 'compression-webpack-plugin';

import { envFile } from '../../utils/env-utils';
import { checkServer } from '../../utils/env';
import { COMPRESSION_FILES_REGEX } from '../../const/values';

const prodConfig = (env: any) => {
  const isServer = checkServer();

  const plugins: WebpackPluginInstance[] = [
    new Dotenv({ path: path.resolve(process.cwd(), envFile(`.env.prod`)) }),
  ];

  const deployEnvFile = path.resolve(process.cwd(), `starter/env/.env.deploy.tmp`);
  if (fs.existsFileSync(deployEnvFile)) {
    plugins.push(new Dotenv({ path: deployEnvFile }));
  }

  if(!isServer) {
    plugins.push(
      new CompressionPlugin({
        test: COMPRESSION_FILES_REGEX,
        algorithm: 'gzip',
        filename: '[path][base].gz',
      }),
      new CompressionPlugin({
        test: COMPRESSION_FILES_REGEX,
        algorithm: 'brotliCompress',
        filename: '[path][base].br',
      })
    );
  }

  return ({
    mode: 'production',
    optimization: {
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: Infinity,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module: any) {
              let packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
              // packageName = packageName.replace('@', '');
              if (packageName === 'react' || packageName === 'react-dom') {
                return 'vendor-react';
              } else if (packageName === '@chakra-ui') {
                return 'vendor-ui';
              } else {
                return 'vendor-other';
              }
            },
          },
        },
      }
    },
    plugins,
    performance: {
      hints: false
    },
  });
};

export default prodConfig;
