// shared config (dev and prod)
const { resolve } = require('path');
// const StyleLintPlugin = require('stylelint-webpack-plugin');

module.exports = {
  resolve: {
    extensions: [".ts", ".tsx", ".js", '.jsx', ".json", "scss"],
  },
  target: 'electron-renderer',
  context: resolve(__dirname, '../src/pages'),
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', { loader: 'css-loader', options: { importLoaders: 1 } },],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
          // Compiles Sass to CSS
          "sass-loader",
        ],
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          'file-loader?hash=sha512&digest=hex&name=img/[hash].[ext]',
          'image-webpack-loader?bypassOnDebug&optipng.optimizationLevel=7&gifsicle.interlaced=false',
        ],
      },
      {
        test: /\.(eot|ttf|woff|woff2|otf)$/,
        use: ['file-loader?hash=sha512&digest=hex&name=img/[hash].[ext]']
      }
    ],
  },
  plugins: [
    // new CheckerPlugin(),
  ],
  performance: {
    hints: false,
  },
};