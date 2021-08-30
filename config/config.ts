import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [{ path: '/', component: '@/pages/index' }],
  fastRefresh: {},
  mfsu: {},
  webpack5: {},
  theme: {
    '@btn-text-hover-bg': '#D0DAEF',
    '@modal-header-bg': '#1F57C3',
    '@modal-close-color': '#fff',
    '@modal-heading-color': '#fff',
    '@tooltip-bg': 'rgba(0, 0, 0, 0.45)',
  },
  dynamicImport: {
    loading: '@ant-design/pro-layout/es/PageLoading',
  },
  extraBabelPlugins: [
    [
      'babel-plugin-import',
      { libraryName: '@formily/antd', libraryDirectory: 'lib', style: true },
    ],
  ],
  proxy: {
    '/api': {
      target: 'http://192.168.101.135:9526',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
});
