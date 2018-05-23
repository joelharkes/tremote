// shared config (dev and prod)
const { resolve } = require('path');
const { CheckerPlugin } = require('awesome-typescript-loader');
// const StyleLintPlugin = require('stylelint-webpack-plugin');

module.exports = {
  resolve: {
    extensions: [".ts", ".tsx", ".js", '.jsx', ".json", "scss"],
  },
  target: 'electron-renderer',
  context: resolve(__dirname, '../src/pages'),
  module: {
    rules: [
      // {
      //   test: /\.js$/,
      //   use: ['babel-loader'/* , 'source-map-loader' */], //['script-loader'], //['babel-loader', 'source-map-loader'],
      //   exclude: /node_modules/,
      // },
      {
        test: /\.tsx?$/,
        use: {
          loader: 'awesome-typescript-loader',
          query: {
            useCache: true,
            forceIsolatedModules: true,
          }
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', { loader: 'css-loader', options: { importLoaders: 1 } },],
      },
      {
        test: /\.scss$/,
        loaders: [
          'style-loader',
          { loader: 'css-loader', options: { importLoaders: 1 } },
          'sass-loader',
        ],
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: [
          'file-loader?hash=sha512&digest=hex&name=img/[hash].[ext]',
          'image-webpack-loader?bypassOnDebug&optipng.optimizationLevel=7&gifsicle.interlaced=false',
        ],
      },
      {
        test: /\.(eot|ttf|woff|woff2|otf)$/,
        loader: 'file-loader?hash=sha512&digest=hex&name=img/[hash].[ext]'
      }
    ],
  },
  plugins: [
    new CheckerPlugin(),
  ],
  performance: {
    hints: false,
  },
};