/**
 * @author: Yuki Takei <yuki@weseek.co.jp>
 */
const path = require('path');
const webpack = require('webpack');

/*
  * Webpack Plugins
  */
const WebpackAssetsManifest = require('webpack-assets-manifest');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

/*
  * Webpack configuration
  *
  * See: http://webpack.github.io/docs/configuration.html#cli
  */
module.exports = (options) => {
  return {
    mode: options.mode,
    entry: Object.assign({
      'js/boot':                      './src/client/boot',
      'js/app':                       './src/client/app',
      'js/admin':                     './src/client/admin',
      'js/nologin':                   './src/client/nologin',
      'js/legacy':                    './src/client/legacy/crowi',
      'js/legacy-presentation':       './src/client/legacy/crowi-presentation',
      'js/plugin':                    './src/client/plugin',
      'js/ie11-polyfill':             './src/client/ie11-polyfill',
      'js/hackmd-agent':              './src/client/hackmd-agent',
      'js/hackmd-styles':             './src/client/hackmd-styles',
      // styles
      'styles/style-app':             './src/styles/style-app.scss',
      'styles/style-presentation':    './src/styles/style-presentation.scss',
      // themes
      'styles/theme-default':         './src/styles/theme/default.scss',
      'styles/theme-nature':          './src/styles/theme/nature.scss',
      'styles/theme-mono-blue':       './src/styles/theme/mono-blue.scss',
      'styles/theme-future':          './src/styles/theme/future.scss',
      'styles/theme-kibela':          './src/styles/theme/kibela.scss',
      'styles/theme-halloween':       './src/styles/theme/halloween.scss',
      'styles/theme-christmas':       './src/styles/theme/christmas.scss',
      'styles/theme-wood':            './src/styles/theme/wood.scss',
      'styles/theme-island':          './src/styles/theme/island.scss',
      'styles/theme-antarctic':       './src/styles/theme/antarctic.scss',
      'styles/theme-spring':          './src/styles/theme/spring.scss',
      'styles/theme-hufflepuff':      './src/styles/theme/hufflepuff.scss',
      // styles for external services
      'styles/style-hackmd':          './src/styles-hackmd/style.scss',
    }, options.entry || {}), // Merge with env dependent settings
    output: Object.assign({
      path: path.resolve(__dirname, '../public'),
      publicPath: '/',
      filename: '[name].bundle.js',
    }, options.output || {}), // Merge with env dependent settings
    externals: {
      // require("jquery") is external and available
      //  on the global var jQuery
      jquery: 'jQuery',
      emojione: 'emojione',
      hljs: 'hljs',
    },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      // modules: ((options.resolve && options.resolve.modules) || []).concat([path.resolve(__dirname, 'node_modules')]),
      alias: {
        '~': path.resolve(__dirname, '../src'), // src
        '^': path.resolve(__dirname, '../'), // project root
        '@root': path.resolve(__dirname, '../'),
        '@commons': path.resolve(__dirname, '../src/lib'),
        '@client': path.resolve(__dirname, '../src/client'),
        '@alias/logger': path.resolve(__dirname, '../src/utils/logger'),
      },
    },
    module: {
      rules: options.module.rules.concat([
        {
          test: /.jsx?$/,
          exclude: {
            test: path.resolve(__dirname, '../node_modules'),
            exclude: [ // include as a result
              { test: path.resolve(__dirname, '../node_modules/growi-plugin-') },
              path.resolve(__dirname, '../node_modules/growi-commons'),
              path.resolve(__dirname, '../node_modules/codemirror/src'),
            ],
          },
          use: [{
            loader: 'babel-loader?cacheDirectory',
          }],
        },
        {
          test: /locales/,
          loader: '@alienfast/i18next-loader',
          options: {
            basenameAsNamespace: true,
          },
        },
        /*
          * File loader for supporting images, for example, in CSS files.
          */
        {
          test: /\.(jpg|png|gif)$/,
          use: 'file-loader',
        },
        /* File loader for supporting fonts, for example, in CSS files.
         */
        {
          test: /\.(eot|woff2?|svg|ttf)([?]?.*)$/,
          use: 'null-loader',
        },
      ]),
    },
    plugins: options.plugins.concat([

      new WebpackAssetsManifest({ publicPath: true }),

      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      }),

      // ignore
      new webpack.IgnorePlugin(/^\.\/lib\/deflate\.js/, /markdown-it-plantuml/),
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),

      new LodashModuleReplacementPlugin({
        flattening: true,
      }),

      new webpack.ProvidePlugin({ // refs externals
        jQuery: 'jquery',
        $: 'jquery',
      }),

    ]),

    devtool: options.devtool,
    target: 'web', // Make web variables accessible to webpack, e.g. window
    optimization: {
      namedModules: true,
      splitChunks: {
        cacheGroups: {
          style_commons: {
            test: /\.(sc|sa|c)ss$/,
            chunks: (chunk) => {
              // ignore patterns
              return chunk.name != null && !chunk.name.match(/style-|theme-|legacy-presentation/);
            },
            name: 'styles/style-commons',
            minSize: 1,
            priority: 30,
            enforce: true,
          },
          commons: {
            test: /(src|resource)[\\/].*\.(js|jsx|json)$/,
            chunks: (chunk) => {
              // ignore patterns
              return chunk.name != null && !chunk.name.match(/boot/);
            },
            name: 'js/commons',
            minChunks: 2,
            minSize: 1,
            priority: 20,
          },
          vendors: {
            test: /node_modules[\\/].*\.(js|jsx|json)$/,
            chunks: (chunk) => {
              // ignore patterns
              return chunk.name != null && !chunk.name.match(/boot|legacy-presentation|ie11-polyfill|hackmd-/);
            },
            name: 'js/vendors',
            minSize: 1,
            priority: 10,
            enforce: true,
          },
        },
      },
      minimizer: options.optimization.minimizer || [],
    },
    performance: options.performance || {},
    stats: options.stats || {},
  };
};
