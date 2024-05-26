import type {StorybookConfig} from '@storybook/react-vite'
const viteTsconfig = require('vite-tsconfig-paths')
const tsconfigPaths = viteTsconfig.default
const {mergeConfig} = require('vite')

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-links',
    'storybook-addon-fetch-mock',
    'storybook-addon-remix-react-router'
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {}
  },
  docs: {
    autodocs: 'tag'
  },
  staticDirs: [{from: '../test/assets/', to: '/test/assets/'}],
  async viteFinal(config) {
    return mergeConfig(config, {
      plugins: [tsconfigPaths()]
    })
  }
}
export default config
