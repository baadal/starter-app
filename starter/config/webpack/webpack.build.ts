import path from 'path';
import webpack from 'webpack';

// @ts-ignore
import nodeExternals from 'webpack-node-externals';

import { commonFile } from '../../utils/env-utils';

const config: webpack.Configuration = {
  mode: 'production',
  entry: {
    scriptTop: `./${commonFile('script-top.ts')}`,
    scriptBottom: `./${commonFile('script-bottom.ts')}`,
  },
  output: {
    filename: '[name].js',
    path: path.resolve(process.cwd(), 'build/public'),
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      starter: path.resolve(process.cwd(), 'starter/'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              "@babel/preset-typescript",
            ]
          }
        },
      },
    ]
  },
  plugins: [],
  externalsPresets: { node: true },
  externals: [nodeExternals()],
  stats: {
    timings: false,
    hash: false,
    version: false,
    builtAt: false,
    assets: false,
    entrypoints: false,
    modules: false,
    chunks: false,
    children: false
  },
};

export default config;
