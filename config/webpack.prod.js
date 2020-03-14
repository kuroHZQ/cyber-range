const webpackConfigCreator = require('./webpack.common')
const merge = require('webpack-merge')
const OptimizeCss = require('optimize-css-assets-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')

const config = {
  output: {
    filename: 'js/[name][chunkhash].js',
  },
  devtool: 'source-map',
  plugins: [
    new OptimizeCss({
      cssProcessor: require('cssnano'),
      cssProcessorOptions: {discardComments: {removeAll: true}},
      canPrint: true,
    }),
    new ManifestPlugin(),
  ],
}

const options = {
  mode: 'production',
}

module.exports = merge(webpackConfigCreator(options), config)
