const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  target: 'node-webkit',
  // Don't bundle Node.js built-in modules
  externals: {
    fs: 'commonjs fs',
    path: 'commonjs path'
  },
  // Enable source maps for debugging
  devtool: 'source-map',
  // Set Node.js global variables
  node: {
    __dirname: false,
    __filename: false
  }
};
