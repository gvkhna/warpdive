// Import React and the necessary Storybook components
import React from 'react'
import {type Meta, type StoryObj} from '@storybook/react'
import FileSystemViewer from './file-system-viewer'
import {WarpDiveImage, WarpDiveImage_TreeNode, WarpDiveImage_TreeNode_Ref} from '@/generated/warpdive_pb'
// Define the metadata for the Storybook
const meta: Meta<typeof FileSystemViewer> = {
  title: 'ContainerBrowser/FileSystemViewer',
  component: FileSystemViewer,
  parameters: {
    layout: 'fullscreen' // Adjust layout as needed
  }
}

export default meta

const data = [
  {
    id: 'root-folder-a-and-a',
    label: 'Folder A + A',
    toolTipText: 'Folder A + A tooltip',
    children: [
      {
        id: 'folder-a-minus-a',
        label: 'Folder A - A',
        toolTipText: 'Folder A - A tooltip',
        children: []
      }
    ]
  },
  {
    id: 'long-folder-a',
    label: 'Folder A',
    toolTipText: 'Folder A tooltip',
    children: [
      {
        id: 'long-folder-a1',
        label: 'Folder A.1',
        toolTipText: 'Folder A.1 tooltip',
        children: [
          {
            id: 'folder-a11',
            label: 'A.1.1',
            toolTipText: 'A.1.1 tooltip',
            children: [
              {
                id: 'folder-a111',
                label: 'A.1.1.1',
                toolTipText: 'A.1.1.1 tooltip'
              }
            ]
          },
          {
            id: 'folder-a12',
            label: 'A.1.2',
            toolTipText: 'A.1.2 tooltip'
          },
          {
            id: 'folder-a13',
            label: 'A.1.3',
            toolTipText: 'A.1.3 tooltip'
          }
        ]
      },
      {
        id: 'folder-a2',
        label: 'Folder A.2',
        toolTipText: 'Folder A.2 tooltip',
        children: [
          {
            id: 'folder-a21',
            label: 'A.2.1',
            toolTipText: 'A.2.1 tooltip'
          },
          {
            id: 'folder-a22',
            label: 'A.2.2',
            toolTipText: 'A.2.2 tooltip'
          },
          {
            id: 'folder-a23',
            label: 'A.2.3',
            toolTipText: 'A.2.3 tooltip'
          }
        ]
      }
    ]
  },
  {
    id: 'folder-b',
    label: 'Folder B',
    toolTipText: 'Folder B tooltip',
    children: [
      {
        id: 'folder-b1',
        label: 'Folder B.1',
        toolTipText: 'Folder B.1 tooltip',
        children: [
          {
            id: 'folder-b11',
            label: 'B.1.1',
            toolTipText: 'B.1.1 tooltip'
          },
          {
            id: 'folder-b12',
            label: 'B.1.2',
            toolTipText: 'B.1.2 tooltip'
          },
          {
            id: 'folder-b13',
            label: 'B.1.3',
            toolTipText: 'B.1.3 tooltip'
          }
        ]
      }
    ]
  },
  {
    id: 'folder-c',
    label: 'Folder C',
    toolTipText: 'Folder C tooltip',
    children: [
      {
        id: 'folder-c1',
        label: 'Folder C.1',
        toolTipText: 'Folder C.1 tooltip',
        children: []
      },
      {
        id: 'folder-c2',
        label: 'Folder C.2',
        toolTipText: 'Folder C.2 tooltip',
        children: [
          {
            id: 'folder-c21',
            label: 'C.2.1',
            toolTipText: 'C.2.1 tooltip',
            children: [
              {
                id: 'folder-c211',
                label: 'C.2.1.1',
                toolTipText: 'C.2.1.1 tooltip',
                children: [
                  {
                    id: 'folder-c2111',
                    label: 'C.2.1.1.1',
                    toolTipText: 'C.2.1.1.1 tooltip',
                    children: [
                      {
                        id: 'folder-c21111',
                        label: 'C.2.1.1.1.1',
                        toolTipText: 'C.2.1.1.1.1 tooltip'
                      },
                      {
                        id: 'folder-c21112',
                        label: 'C.2.1.1.1.2',
                        toolTipText: 'C.2.1.1.1.2 tooltip'
                      },
                      {
                        id: 'folder-c21113',
                        label: 'C.2.1.1.1.3',
                        toolTipText: 'C.2.1.1.1.3 tooltip'
                      },
                      {
                        label: 'C.2.1.1.1.4',
                        toolTipText: 'C.2.1.1.1.4 tooltip'
                      }
                    ]
                  }
                ]
              },
              {
                id: 'folder-c212',
                label: 'C.2.1.2',
                toolTipText: 'C.2.1.2 tooltip'
              },
              {
                id: 'folder-c213',
                label: 'C.2.1.3',
                toolTipText: 'C.2.1.3 tooltip'
              },
              {
                id: 'folder-c214',
                label: 'C.2.1.4',
                toolTipText: 'C.2.1.4 tooltip'
              },
              {
                id: 'folder-c215',
                label: 'C.2.1.5',
                toolTipText: 'C.2.1.5 tooltip'
              },
              {
                id: 'folder-c216',
                label: 'C.2.1.6',
                toolTipText: 'C.2.1.6 tooltip'
              }
            ]
          }
        ]
      },
      {
        id: 'folder-c3',
        label: 'Folder C.3',
        toolTipText: 'Folder C.3 tooltip',
        children: []
      }
    ]
  },
  {
    id: 'folder-some-really-long-text',
    label: 'Some Really Long Name With Spaces And Extra Text To Make It Even Longer Than It Was',
    toolTipText: 'Some Really Long Name With Spaces And Extra Text To Make It Even Longer Than It Was tooltip',
    children: [
      {
        id: 'folder-special-chars',
        label: 'Special Characters: ~!@#$%^&*()_-+={}|\\[];"\'<>,./?',
        toolTipText: 'Special Characters: ~!@#$%^&*()_-+={}|\\[];"\'<>,./? tooltip'
      }
    ]
  },
  {
    id: 'duplicate1',
    label: 'Duplicate',
    toolTipText: 'Duplicate 1',
    children: []
  },
  {
    id: 'duplicate2',
    label: 'Duplicate',
    toolTipText: 'Duplicate 2',
    children: []
  }
]

const createData = () => {
  let largeData: any = [...data]
  for (let i = 0; i < 1000; i += 1) {
    largeData = largeData.concat([
      {
        id: `myid-${i}`,
        label: `My Label ${i}`,
        collapsed: true,
        children: [
          {
            id: `myid-child1-${i}`,
            label: `My Child Label 1-${i}`
          },
          {
            id: `myid-child2-${i}`,
            label: `My Child Label 2-${i}`
          },
          {
            id: `myid-child3-${i}`,
            label: `My Child Label 3-${i}`
          },
          {
            id: `myid-child4-${i}`,
            label: `My Child Label 4-${i}`
          },
          {
            id: `myid-child5-${i}`,
            label: `My Child Label 5-${i}`
          }
        ]
      }
    ])
  }
  return largeData
}

const data_ = createData()

// Define the story for the default view of the TOC component
export const Default: StoryObj<typeof FileSystemViewer> = {
  render: () => {
    return (
      <>
        <style type='text/css'>
          {`

      .List {
  border: 1px solid #d9dddd;
}

.tree-item-open,
.tree-item-closed {
  display: flex;
  align-items: center;
  justify-content: left;
}

.tree-branch::after {
  content: '';
  display: block;
  width: 0;
  height: 0;
  margin-top: 1px;
  margin-left: 23px;
  border-top: 6px solid rgba(0, 0, 0, 0.7);
  border-right: 6px solid transparent;
  border-left: 6px solid transparent;
  opacity: 0.7;
  position: absolute;
  top: 0;
  left: -36px;
  /*  transform: rotate(90deg); */
  animation-duration: 0.3s;
  transition: border 0.3s;
  transform: translate(0, 0);
}

.tree-item-closed::after {
  border-left: 6px solid rgba(0, 0, 0, 0.7);
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-right: 0;
  /* transform: rotate(90deg); */
  animation-duration: 0.3s;
  transform: translate(2px, -2px);
  transition: border 0.3s;
}

.item-background {
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
}

.item-background:hover {
  background-color: rgba(207, 208, 209, 1);
  cursor: pointer;
} `}
        </style>
        <div className='min-h-[400px] min-w-[400px]'>{/* <FileSystemViewer data={data_} /> */}</div>
      </>
    )
  }
}
