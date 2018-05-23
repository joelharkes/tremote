// production config
const merge = require('webpack-merge');
const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const commonConfig = require('./common');
module.exports = merge(commonConfig, {
  mode: 'production',
  entry: './index.tsx',
  context: resolve(__dirname, '../src/pages'),
  output: {
    filename: 'render.js',
    path: resolve(__dirname, '..', 'output'),
    publicPath: '',
  },
  // devtool: 'source-map',
  plugins: [
    new HtmlWebpackPlugin({ template: 'index.html.ejs', }),
  ],
});