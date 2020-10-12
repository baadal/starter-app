import path from 'path';
import { Configuration,  WebpackPluginInstance } from 'webpack';
import Dotenv from 'dotenv-webpack';

import { envFile } from '../../utils/env-utils';

const devConfig = (env: any) => {
  const plugins: WebpackPluginInstance[] = [
    new Dotenv({ path: path.resolve(process.cwd(), envFile(`.env.dev`)) }),
  ];

  const config: Configuration = {
    mode: 'development',
    optimization: {
      minimize: false,
      splitChunks: false
    },
    plugins,
  };

  return config;
};

export default devConfig;
