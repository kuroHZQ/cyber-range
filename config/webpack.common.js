const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

function webpackCommonConfigCreator(options) {
  /**
   * options:
   * mode // 开发模式
   */

  return {
    mode: options.mode,
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, '../build'),
      filename: '[name].js',
      chunkFilename: '[name].[chunkhash].js',
      publicPath: '/',
    },
    // 专门解决路径相关问题
    resolve: {
      extensions: ['.js', '.vue', '.json'],
      alias: {
        '@': path.resolve('src'), // 给src起了个别名
        // assets: resolve('@/assets'),
        // components: resolve('@/components'),
        // views: resolve('@/views'),
      },
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          include: path.resolve(__dirname, '../src'),
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env', '@babel/preset-react'],
                plugins: [
                  // '@babel/plugin-transform-arrow-functions',
                  // [
                  //   'babel-plugin-transform-runtime',
                  //   {
                  //     helpers: false,
                  //     polyfill: false,
                  //     regenerator: true,
                  //     moduleName: 'babel-runtime',
                  //   },
                  // ],
                  ['@babel/plugin-proposal-decorators', {legacy: true}], // 支持装饰器
                  '@babel/plugin-proposal-class-properties', //  react里class里支持'property = '写法
                  ['react-hot-loader/babel'],
                  [
                    'import',
                    {
                      libraryName: 'antd',
                      // "libraryDirectory": "es",
                      style: 'css', // `style: true` 会加载 less 文件
                    },
                  ],
                ],
              },
            },
          ],
        },
        {
          test: /\.(css|scss)$/,
          include: path.resolve(__dirname, '../src'),
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
              {
                loader: 'css-loader',
                options: {
                  modules: {
                    mode: 'local',
                    localIdentName: '[path][name]_[local]--[hash:base64:5]',
                  },
                  localsConvention: 'camelCase',
                },
              },
              'sass-loader',
              {
                loader: 'postcss-loader',
                options: {
                  ident: 'postcss',
                  plugins: loader => [
                    require('postcss-import')({root: loader.resourcePath}),
                    require('autoprefixer')(),
                  ],
                },
              },
            ],
          }),
        },
        // {
        //   test: /\.(css|scss)$/,
        //   exclude: path.resolve(__dirname, '../src'),
        //   use: [
        //     'style-loader/url',
        //     {
        //       loader: 'file-loader',
        //       options: {
        //         name: 'css/[name].css',
        //         publicPath: '/',
        //       },
        //     },
        //   ],
        // },
        // 针对antd单独设置
        {
          test: /\.css$/,
          include: [/[\\/]node_modules[\\/].*antd/],
          use: [{loader: 'style-loader'}, {loader: 'css-loader'}],
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          use: ['file-loader'],
        },
        {
          test: /\.(jpg|png|svg|gif)$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 10240,
                name: 'images/[hash].[ext]',
                publicPath: '/',
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, '../public/view/index.html'),
        filename: 'index.html',
      }),
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: [
          path.resolve(process.cwd(), 'build/'),
          path.resolve(process.cwd(), 'dist/'),
        ],
      }),
      new ExtractTextPlugin({
        filename: 'css/[name].[hash].css',
      }),
    ],
    optimization: {
      splitChunks: {
        chunks: 'all',
        minSize: 30000,
        minChunks: 1,
      },
    },
  }
}

module.exports = webpackCommonConfigCreator
