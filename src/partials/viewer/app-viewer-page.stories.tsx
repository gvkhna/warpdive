import type {Meta, StoryObj} from '@storybook/react'
import {withRouter, reactRouterParameters} from 'storybook-addon-remix-react-router'

import AppViewerPage from './app-viewer-page'
import AppLayout from '../app/app-layout'
const meta = {
  title: 'ContainerBrowser/Viewer',
  component: AppViewerPage,
  decorators: [withRouter],
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof AppViewerPage>

export default meta
type Story = StoryObj<typeof meta>

export const TestFile: Story = {
  render: () => (
    <AppLayout>
      <AppViewerPage fileOverride='/test/assets/phusion-baseimage-docker-noble-1-0-0.warpdive' />
    </AppLayout>
  ),
  args: {},
  parameters: {
    viewport: {
      // defaultViewport: 'desktop'
    },
    reactRouter: reactRouterParameters({
      routing: {
        path: '/app/deployment/lskdjf'
      }
    })
  }
}

export const TestFileMobile: Story = {
  render: () => (
    <AppLayout>
      <AppViewerPage fileOverride='/test/assets/phusion-baseimage-docker-noble-1-0-0.warpdive' />
    </AppLayout>
  ),
  args: {},
  parameters: {
    viewport: {
      defaultViewport: 'mobile1'
    },
    reactRouter: reactRouterParameters({
      routing: {
        path: '/app/deployment/lskdjf'
      }
    })
  }
}

export const TestFileError: Story = {
  render: () => (
    <AppLayout>
      <AppViewerPage fileOverride='/test/assets/phusion-baseimage-docker-noble-1-0-0' />
    </AppLayout>
  ),
  args: {},
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: '/app/deployment/lskdjf'
      }
    })
  }
}
