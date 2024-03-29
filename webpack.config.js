var path = require("path");
var fs = require("fs");

var config = {
  mode: 'production',
  target: 'electron-main',
  // devtool: 'source-map',
  /*
   * index.tsx represents the entry point to your web application. Webpack will
   * recursively go through every "require" statement in index.tsx and
   * efficiently build out the application's dependency tree.
   */
  entry: './src/main/index.ts',
  /*
   * The combination of path and filename tells Webpack what name to give to
   * the final bundled JavaScript file and where to store this file.
   */
  node: {
    __dirname: false, //make sure __dirname does not get mocked by webpack
    __filename: false
  },
  output: {
    path: path.resolve(__dirname, "output"),
    filename: 'index.js',
    publicPath: "/output/"
  },

  /*
   * resolve lets Webpack now in advance what file extensions you plan on
   * "require"ing into the web application, and allows you to drop them
   * in your code.
   */
  resolve: {
    extensions: [".ts", ".tsx", ".js", '.jsx', ".json"/* , "scss" */]
  },

  module: {
    /*
     * Each loader needs an associated Regex test that goes through each
     * of the files you've included (or in this case, all files but the
     * ones in the excluded directories) and finds all files that pass
     * the test. Then it will apply the loader to that file.
     */
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },

    ]
  }
};

module.exports = config;
