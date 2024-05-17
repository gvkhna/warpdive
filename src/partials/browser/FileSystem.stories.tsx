// Import React and the necessary Storybook components
import React from 'react'
import {type Meta, type StoryObj} from '@storybook/react'
import FileSystemViewer from './FileSystemViewer'
import type {WarpDiveImage} from '@/generated/warpdive_pb'

// Define the metadata for the Storybook
const meta: Meta<typeof FileSystemViewer> = {
  title: 'ContainerBrowser/FileSystem',
  component: FileSystemViewer,
  parameters: {
    layout: 'fullscreen' // Adjust layout as needed
  }
}

export default meta

// Define a default set of elements for the TOC
// const defaultTOC: TreeViewElement[] = [
//   {
//     id: '1',
//     name: 'components',
//     children: [
//       {
//         id: '2',
//         name: 'extension',
//         children: [
//           {id: '3', name: 'tree-view.tsx'},
//           {id: '4', name: 'tree-view-api.tsx'}
//         ]
//       },
//       {id: '5', name: 'dashboard-tree.tsx'}
//     ]
//   },
//   {
//     id: '6',
//     name: 'pages',
//     children: [
//       {id: '7', name: 'page.tsx'},
//       {id: '8', name: 'page-guide.tsx'}
//     ]
//   },
//   {
//     id: '18',
//     name: 'env.ts'
//   }
// ]

const mockWarpDiveImage: WarpDiveImage = {
  nodes: {
    1: {gid: '1', data: {oneofKind: 'fileTree', fileTree: {name: 'root', size: '1000', fileSize: '3000'}}},
    2: {gid: '2', data: {oneofKind: 'fileNode', fileNode: {name: 'file1.tsx', size: '200', childrenRefs: []}}},
    3: {gid: '3', data: {oneofKind: 'fileNode', fileNode: {name: 'file2.tsx', size: '150', childrenRefs: []}}}
  },
  tree: {
    ref: {gid: '1'},
    children: [
      {
        ref: {gid: '2'},
        children: [] // No children for file1.tsx
      },
      {
        ref: {gid: '3'},
        children: [] // No children for file2.tsx
      }
    ]
  }
}

// Define the story for the default view of the TOC component
export const Default: StoryObj<typeof FileSystemViewer> = {
  render: () => (
    <div className=' w-[420px]'>
      <FileSystemViewer image={mockWarpDiveImage} />
    </div>
  )
}
