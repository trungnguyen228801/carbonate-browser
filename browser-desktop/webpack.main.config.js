const path = require('path');

module.exports = {
  entry: './src/main.js',
  target: 'electron-main',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js'
  },
  node: {
    __dirname: false,
    __filename: false
  },
  resolve: {
    extensions: ['.js', '.json']
  }
};
