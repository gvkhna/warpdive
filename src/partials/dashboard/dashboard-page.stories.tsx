import type {Meta, StoryObj} from '@storybook/react'
import {withRouter, reactRouterParameters} from 'storybook-addon-remix-react-router'

import {DashboardPage} from './dashboard-page'
import {AppLayout} from '../app/app-layout'
const meta = {
  title: 'App/Dashboard',
  component: DashboardPage,
  decorators: [withRouter],
  parameters: {
    layout: 'fullscreen'
  }
  // argTypes: {
  // }
} satisfies Meta<typeof DashboardPage>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  render: () => (
    <AppLayout>
      <DashboardPage />
    </AppLayout>
  ),
  args: {},
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: '/app/'
      }
    }),
    fetchMock: {
      mocks: [
        {
          matcher: {
            name: 'default',
            url: 'path:/api/dashboard'
          },
          response: {
            status: 200,
            body: {
              projects: [],
              recentBuilds: []
            }
          }
        }
      ]
    }
  }
}

export const Content: Story = {
  render: () => (
    <AppLayout>
      <DashboardPage />
    </AppLayout>
  ),
  args: {},
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: '/app/'
      }
    }),
    fetchMock: {
      mocks: [
        {
          matcher: {
            name: 'default',
            url: 'path:/api/dashboard'
          },
          response: {
            status: 200,
            body: {
              projects: [
                {
                  pid: '0123',
                  name: 'warpdive'
                }
              ],
              recentBuilds: [
                {
                  pid: '1231231',
                  projectPid: '0123',
                  imageSha: '123456',
                  tag: '1.0.0',
                  builtWith: 'Github Actions',
                  builtBy: 'gvkhna',
                  createdAt: '2024-05-24 22:17:02'
                }
              ]
            }
          }
        }
      ]
    }
  }
}
