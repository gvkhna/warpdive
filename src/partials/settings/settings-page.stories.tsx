import type {Meta, StoryObj} from '@storybook/react'
import {withRouter, reactRouterParameters} from 'storybook-addon-remix-react-router'

import {SettingsPage} from './settings-page'
import {AppLayout} from '../app/app-layout'
import {ShowApiKeyDialog} from './show-api-key-dialog'
import {useState} from 'react'
const meta = {
  title: 'App/Settings',
  component: SettingsPage,
  decorators: [withRouter],
  parameters: {
    layout: 'fullscreen'
  }
  // argTypes: {
  // }
} satisfies Meta<typeof SettingsPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <AppLayout>
      <SettingsPage />
    </AppLayout>
  ),
  args: {},
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: '/app/settings'
      }
    }),
    fetchMock: {
      mocks: [
        {
          matcher: {
            name: 'default',
            url: 'path:/api/users/settings'
          },
          response: {
            status: 200,
            body: {
              message: 'Unable to delete user, something failed'
            }
          }
        },
        {
          matcher: {
            name: 'delete',
            url: 'path:/api/users/delete'
          },
          response: {
            status: 500,
            body: {
              message: 'Unable to delete user, something failed'
            }
          }
        }
      ]
    }
  }
}

export const Error: Story = {
  render: () => (
    <AppLayout>
      <SettingsPage showInitialError={true} />
    </AppLayout>
  ),
  args: {},
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: '/app/settings'
      }
    })
  }
}

export const ShowApiKey: Story = {
  render: function TestApiKey() {
    const [open, setOpen] = useState(true)
    return (
      <AppLayout>
        <SettingsPage />
        <ShowApiKeyDialog
          open={open}
          onOpenChange={setOpen}
          apiKey='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMUhZUDg1MFJBNzEwOEFFRkY2M1g0UFEwViIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxNzE5MTc4MjYxMDU0fQ.ZZ_vAIyh_H9mkc822s7fqsAJWP1o38z-izxy3ShUB-8'
        />
      </AppLayout>
    )
  },
  args: {},
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: '/app/settings'
      }
    })
  }
}
