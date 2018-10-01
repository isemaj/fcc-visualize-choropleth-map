const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  mode: 'production',
  target: 'web',
  entry: './src/js/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  devServer: {
    port: 9000,
    hot: true,
    hotOnly: true,
  },
  module: {
    rules: [
      {
        test: /\.pug$/,
        use: [
          {
            loader: 'pug-loader',
          },
        ],
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({
      title: 'FCC Choropleth Map',
      hash: true,
      template: './src/index.pug',
    }),
    new webpack.HotModuleReplacementPlugin({
      multiStep: true,
    }),
    new webpack.SourceMapDevToolPlugin({
      filename: '[name].js.map',
    }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
};
