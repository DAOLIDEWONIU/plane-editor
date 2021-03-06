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
  },
});
