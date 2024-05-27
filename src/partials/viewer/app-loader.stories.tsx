import type {Meta, StoryObj} from '@storybook/react'
import {withRouter, reactRouterParameters} from 'storybook-addon-remix-react-router'

import AppLoader from './app-loader'
import AppLayout from '../app/app-layout'
const meta = {
  title: 'ContainerBrowser/Loader',
  component: AppLoader,
  decorators: [withRouter],
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof AppLoader>

export default meta
type Story = StoryObj<typeof meta>

export const Loading: Story = {
  render: () => (
    <AppLayout>
      <AppLoader
        fileOverride=''
        pid=''
        onFileLoad={() => {}}
        onError={() => {}}
      />
    </AppLayout>
  ),
  args: {
    fileOverride: '',
    pid: '',
    onFileLoad: () => {},
    onError: () => {}
  },
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: '/app/deployment/lskdjf'
      }
    })
  }
}
