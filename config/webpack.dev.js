const webpackConfigCreator = require('./webpack.common')
const merge = require('webpack-merge')
const path = require('path')

const config = {
  output: {
    filename: 'js/[name][hash].js',
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: path.join(__dirname, '../dist'),
    hot: true,
    // 跨域处理
    proxy: {
      '/api': {
        target: 'http://localhost:8101', // 本地后端服务
        changeOrigin: true,
      },
      '/docker': {
        target: 'http://49.235.52.63:9527', // docker remote api
        changeOrigin: true,
        pathRewrite: {'^/docker': ''}, // 将/docker 重定向为 / ，localhost/docker 实际请求的是 49.235.52.63:2375/
      },
    },
  },
}

const options = {
  mode: 'development',
}

module.exports = merge(webpackConfigCreator(options), config)
