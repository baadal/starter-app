import path from 'path';
import webpack, { Configuration, ResolveOptions, Entry, WebpackPluginInstance } from 'webpack';
import merge from 'webpack-merge';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import Dotenv from 'dotenv-webpack';
import dotenv from 'dotenv';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { fs } from '@baadal-sdk/dapi';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

// @ts-ignore
import nodeExternals from 'webpack-node-externals';
// @ts-ignore
import IgnoreEmitPlugin from 'ignore-emit-webpack-plugin';
// @ts-ignore
import LoadablePlugin from '@loadable/webpack-plugin';
// @ts-ignore
import EventHooksPlugin from 'event-hooks-webpack-plugin';

import dev from './webpack.dev';
import prod from './webpack.prod';
import { checkProd, checkServer, checkModern } from '../../utils/env';
import { envFile } from '../../utils/env-utils';
import * as event from '../../utils/event';

const isProd = checkProd();
const isServer = checkServer();
const isModern = checkModern();
const isAnalyze = (process.env.BUNDLE_ANALYZE === 'true');

const dotEnvFile = envFile(`.env.${isProd ? 'prod' : 'dev'}`);
dotenv.config({ path: path.resolve(process.cwd(), dotEnvFile) });

const common = (env: any) => {
  const buildRoot = 'build';
  const outFolder = isServer ? `${buildRoot}/server` : `${buildRoot}/public`;

  const extJs = isModern ? 'esm.js' : 'js';
  const dirJs = isModern ? 'js/esm/' : (!isServer ? 'js/cjs/' : '');
  const statsFileName = isModern ? 'loadable-stats.esm.json' : 'loadable-stats.json';

  const outputFileName = (!isServer && isProd) ? `[name].[contenthash:10].${extJs}` : `[name].${extJs}`;
  const chunkFilename = (!isServer && isProd) ? `[name].[contenthash:10].chunk.${extJs}` : `[name].chunk.${extJs}`;

  const miniCssFileName = isProd ? 'style.[contenthash:10].css' : 'style.css';
  const miniCssChunkName = isProd ? '[name].[contenthash:10].chunk.css' : '[name].chunk.css';

  const assetName = isProd ? '[name].[contenthash:10][ext]' : '[name][ext]';

  const envConfig: Configuration = {};

  if (isServer) {
    envConfig.externalsPresets = { node: true }; // Target node environment on server (ignore built-in modules like path, fs, etc.)
    envConfig.externals = [nodeExternals()]; // No need to bundle modules in node_modules folder for backend/server
  }

  const resolve: ResolveOptions = {};
  if (!isServer) {
    resolve.fallback = { fs: false }; // Don't provide node module polyfills in non-node environment
  }

  const plugins: WebpackPluginInstance[] = [
    new EventHooksPlugin({
      run: () => event.run(),
      watchRun: () => event.watchRun(),
      make: () => event.make(isServer),
      assetEmitted: (f: string, c: any) => event.assetEmitted(f, c),
      done: () => event.done(isServer),
    }),
    new Dotenv({ path: path.resolve(process.cwd(), envFile(`.env`)) }),
    new Dotenv({ path: path.resolve(process.cwd(), 'starter/env/.env.starter') }),
    new webpack.EnvironmentPlugin({
      npm_package_version: '',
      BUILD_TIME: '',
      NODE_ENV: 'development', // use 'development' unless process.env.NODE_ENV is defined
      PLATFORM: '',
      MODERN: '',
    }),
    new webpack.NormalModuleReplacementPlugin(/IMPORT_POLYFILLS/, (resource: any) => {
      resource.request = resource.request.replace('IMPORT_POLYFILLS', `polyfills-${isModern ? 'modern' : 'legacy'}`);
    }),
    new MiniCssExtractPlugin({
      filename: `css/${miniCssFileName}`,
      chunkFilename: `css/${miniCssChunkName}`,
    }),
  ];

  if (isServer) {
    plugins.push(new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1
    }));
  } else {
    // @ts-ignore
    plugins.push(new LoadablePlugin({
      filename: statsFileName,
      outputAsset: false,
      writeToDisk: {
        filename: path.resolve(process.cwd(), buildRoot),
      }
    }) as any); // [TO FIX]: LoadablePlugin != WebpackPluginInstance
  }

  if (!isServer && !isModern) {
    plugins.push(new CopyWebpackPlugin({
      patterns: [
        { from: 'web/assets/static' }
      ]
    }));
  }

  if (isServer && isProd) {
    plugins.push(new IgnoreEmitPlugin(/\.css$/));
  }

  if (isAnalyze) {
    plugins.push(new BundleAnalyzerPlugin());
  }

  let devtool: Configuration['devtool'] | null = null;
  if (!isServer && !isProd) {
    devtool = 'inline-source-map';
  } else {
    // devtool = 'source-map';
  }

  const assetsBaseUrl = process.env.ASSETS_BASE_URL || '';
  const publicPath = `${assetsBaseUrl}/`;

  const stats = {
    // timings: false,
    hash: false,
    version: false,
    builtAt: false,
    assets: false,
    entrypoints: false,
    modules: false,
    chunks: !true,
    children: false
  };

  const cssLoader = (nextCount: number, modules?: boolean) => {
    if (!modules) {
      return 'css-loader';
    }
    return ({
      loader: 'css-loader',
      options: {
        importLoaders: nextCount,
        // esModule: true,
        modules: {
          // namedExport: true,
          exportLocalsConvention: 'camelCaseOnly',
          localIdentName: isProd ? '[local]_[hash:base64:5]' : '[name]__[local]__[hash:base64:5]',
        },
      }
    });
  };

  const styleLoader = (modules?: boolean) => {
    if (!modules) {
      return 'style-loader';
    }
    return ({
      loader: 'style-loader',
    });
  };

  const cssExtractLoader = (modules?: boolean) => {
    if (!modules) {
      return MiniCssExtractPlugin.loader;
    }
    return ({
      loader: MiniCssExtractPlugin.loader,
    });
  };

  const postcssLoader = () => {
    return ({
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          config: path.resolve(process.cwd(), 'postcss.config.js'),
        },
      },
    });
  };

  const sassLoader = () => {
    let additionalData = `$env: ${process.env.NODE_ENV || 'development'};`;
    const customColorsPath = 'web/assets/css/theme/_colors.scss';
    if (fs.existsFileSync(customColorsPath)) {
      const customColors = fs.readFileSync(customColorsPath);
      additionalData += customColors;
    }

    return ({
      loader: 'sass-loader',
      options: {
        additionalData,
      },
    });
  };

  const getStyleLoaders = (modules?: boolean) => {
    const nextLoaders = [postcssLoader(), sassLoader()];
    const loaders: any[] = [cssLoader(nextLoaders.length, modules), ...nextLoaders];
    if (!isServer) {
      if (!isProd) {
        loaders.unshift(styleLoader(modules));
      } else {
        loaders.unshift(cssExtractLoader(modules));
      }
    } else {
      loaders.unshift(cssExtractLoader(modules));
    }
    return loaders;
  };

  const modernPolyfills: string[] = [
    'intersection-observer',
  ];

  const legacyPolyfills: string[] = [
    'whatwg-fetch',
    ...modernPolyfills
  ];

  const entry: Entry = isServer ? {
    index: './starter/web/index.ts'
  } : {
    client: [
      ...(isModern ? modernPolyfills : legacyPolyfills),
      './starter/web/client.tsx'
    ]
  };

  let config: Configuration = {
    entry,
    output: {
      filename: `${dirJs}${outputFileName}`,
      chunkFilename: `${dirJs}${chunkFilename}`,
      path: path.resolve(process.cwd(), outFolder),
      publicPath,
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      alias: {
        assets: path.resolve(process.cwd(), 'web/assets/'),
        components: path.resolve(process.cwd(), 'web/components/'),
        model: path.resolve(process.cwd(), 'web/model/'),
        pages: path.resolve(process.cwd(), 'web/pages/'),
        api: path.resolve(process.cwd(), 'api/'),
        web: path.resolve(process.cwd(), 'web/'),
        server: path.resolve(process.cwd(), 'server/'),
        starter: path.resolve(process.cwd(), 'starter/'),
      },
      ...resolve,
    },
    module: {
      rules: [
        {
          test: /\.(tsx?|jsx?)$/,
          use: 'babel-loader',
          exclude: {
            and: [
              // exclude libraries in node_modules
              /node_modules/,
            ],
            not: [
              // however, transpile these libraries because they use modern syntax
              /node_modules\/@loadable\/component/,
            ],
          },
        },
        {
          test: /\.s?css$/,
          use: [...getStyleLoaders()],
          exclude: /\.module\.s?css$/,
          sideEffects: true,
        },
        {
          test: /\.module\.s?css$/,
          use: [...getStyleLoaders(true)],
        },
        {
          test: /\.(png|jpe?g|gif|svg|ico)$/i,
          type: 'asset/resource',
          generator: {
            filename: `images/${assetName}`,
            emit: !isServer && !isModern,
          },
        },
        {
          test: /\.(ttf|woff2?)$/i,
          type: 'asset/resource',
          generator: {
            filename: `fonts/${assetName}`,
            emit: !isServer && !isModern,
          },
        },
      ]
    },
    watchOptions: {
      ignored: /node_modules/,
    },
    stats,
    plugins,
    ...envConfig,
  };
  if (devtool) config = { ...config, devtool };

  return config;
};

const config = (env: any = {}) => {
  const commonConfig = common(env);
  const envConfig = (isProd ? prod : dev)(env);
  return merge(commonConfig, envConfig);
};

export default config;
