// development config
const { merge }= require('webpack-merge');
const webpack = require('webpack');
const commonConfig = require('./common');
const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const port = 3009
module.exports = merge(commonConfig, {
  mode: 'development',
  entry: [
    'webpack-dev-server/client?http://localhost:' + port,// bundle the client for webpack-dev-server and connect to the provided endpoint
    'webpack/hot/only-dev-server', // bundle the client for hot reloading, only- means to only hot reload for successful updates
    './index.tsx' // the entry point of our app
  ],
  output: {
    // filename: 'js/bundle.[hash].min.js',
    // path: resolve(__dirname, '../public'),
    publicPath: `/`,
  },
  devServer: {
    hot: true, // enable HMR on the server
    port: port,
    historyApiFallback: true,
  },

  plugins: [
    new HtmlWebpackPlugin({ template: 'index.html.ejs', }),
  ],
});