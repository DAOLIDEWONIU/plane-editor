import { defineConfig } from 'umi';
const assetDir = 'static';

export default defineConfig({
  hash: true, //配置是否让生成的文件包含 hash 后缀，通常用于增量发布和避免浏览器加载缓存。
  esbuild: {},
  extraBabelPlugins: ['transform-remove-console'],
  // chunks: ['vendors', 'umi'],
  targets: {
    chrome: 49,
    firefox: 64,
    safari: 10,
    edge: 13,
    ios: 10,
  },
  externals: {
    react: 'window.React',
    'react-dom': 'window.ReactDOM',
  },
  scripts: [
    'https://gw.alipayobjects.com/os/lib/react/17.0.2/umd/react.production.min.js',
    'https://gw.alipayobjects.com/os/lib/react-dom/17.0.2/umd/react-dom.production.min.js',
  ],
  chainWebpack: function (config: any) {
    config.module
      .rule('mjs-rule')
      .test(/.m?js/)
      .resolve.set('fullySpecified', false);
    // 修改js，js chunk文件输出目录
    config.output
      .filename(assetDir + '/js/[name].[hash:8].js')
      .chunkFilename(assetDir + '/js/[name].[contenthash:8].chunk.js');
    config.merge({
      optimization: {
        minimize: true,
        splitChunks: {
          chunks: 'all',
          minSize: 30000,
          minChunks: 3,
          automaticNameDelimiter: '.',
          cacheGroups: {
            vendor: {
              name: 'vendors',
              test({ resource }: { resource: any }) {
                return /[\\/]node_modules[\\/]/.test(resource);
              },
              priority: 10,
            },
            styles: {
              name: 'styles',
              chunks: 'all',
              test: /(\.less|\.css)$/,
              priority: 10,
              minChunks: 2,
              enforce: true,
            },
          },
        },
      },
    });

    // 修改图片输出目录
    config.module
      .rule('images')
      .test(/\.(png|jpe?g|gif|webp|ico)(\?.*)?$/)
      .use('url-loader')
      .loader(require.resolve('url-loader'))
      .tap((options) => {
        const newOptions = {
          ...options,
          name: assetDir + '/img/[name].[hash:8].[ext]',
          fallback: {
            ...options.fallback,
            options: {
              name: assetDir + '/img/[name].[hash:8].[ext]',
              esModule: false,
            },
          },
        };
        return newOptions;
      });

    // 修改svg输出目录
    config.module
      .rule('svg')
      .test(/\.(svg)(\?.*)?$/)
      .use('file-loader')
      .loader(require.resolve('file-loader'))
      .tap((options) => ({
        ...options,
        name: assetDir + '/img/[name].[hash:8].[ext]',
      }));

    // 修改css输出目录
    config.plugin('extract-css').tap(() => [
      {
        filename: `${assetDir}/css/[name].[contenthash:8].css`,
        chunkFilename: `${assetDir}/css/[name].[contenthash:8].chunk.css`,
        ignoreOrder: true,
      },
    ]);
  },
});
