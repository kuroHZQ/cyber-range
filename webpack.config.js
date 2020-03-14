// __dirname是node.js中的一个全局变量，它指向当前执行脚本所在的目录
// path是node.js中提供的处理文件路径的小工具。 (http://www.runoob.com/nodejs/nodejs-path-module.html)
const path = require('path')

module.exports = {
  // 项目入口，webpack从此处开始构建
  entry: {
    main: path.join(__dirname, 'src/index.js'), // 指定入口，可以指定多个。参考webpack文档
  },
  // 打包文件出口
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'assets/scripts/[name].js',
    chunkFilename: 'assets/scripts/[name].[chunkhash].js',
    publicPath: '/',
  },
  devServer: {
    contentBase: './dist',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [path.resolve(__dirname, 'node_modules')],
        loader: 'babel-loader',
      },
    ],
  },
}
