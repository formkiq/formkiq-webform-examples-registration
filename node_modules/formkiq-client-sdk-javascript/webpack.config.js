var path = require('path');
var webpack = require('webpack');

 module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '../dist/es6/formkiq-client-sdk-es6.js',
    library: "my-library",
    libraryTarget: "umd"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env']
        }
      }
    ]
  },
  stats: {
    colors: true
  },
  devtool: 'source-map'
};