// Import React and the necessary Storybook components
import React from 'react'
import {type Meta, type StoryObj} from '@storybook/react'
import TOC from './FileSystemViewer'
import type {TreeViewElement} from '@/components/extension/tree-view-api'

// Define the metadata for the Storybook
const meta: Meta<typeof TOC> = {
  title: 'Components/FileSystem',
  component: TOC,
  parameters: {
    layout: 'fullscreen' // Adjust layout as needed
  }
}

export default meta

// Define a default set of elements for the TOC
const defaultTOC: TreeViewElement[] = [
  {
    id: '1',
    name: 'components',
    children: [
      {
        id: '2',
        name: 'extension',
        children: [
          {id: '3', name: 'tree-view.tsx'},
          {id: '4', name: 'tree-view-api.tsx'}
        ]
      },
      {id: '5', name: 'dashboard-tree.tsx'}
    ]
  },
  {
    id: '6',
    name: 'pages',
    children: [
      {id: '7', name: 'page.tsx'},
      {id: '8', name: 'page-guide.tsx'}
    ]
  },
  {
    id: '18',
    name: 'env.ts'
  }
]

// Define the story for the default view of the TOC component
export const Default: StoryObj<typeof TOC> = {
  render: () => <TOC toc={defaultTOC} />
}
