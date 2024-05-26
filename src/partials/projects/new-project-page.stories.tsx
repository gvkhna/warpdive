import type {Meta, StoryObj} from '@storybook/react'
import {withRouter, reactRouterParameters} from 'storybook-addon-remix-react-router'

import NewProjectPage from './new-project-page'
import AppLayout from '../app/app-layout'
const meta = {
  title: 'Projects/New',
  component: NewProjectPage,
  decorators: [withRouter],
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof NewProjectPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <AppLayout>
      <NewProjectPage />
    </AppLayout>
  ),
  args: {},
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: '/app/projects/new'
      }
    })
  }
}
