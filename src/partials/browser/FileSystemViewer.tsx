import {Tree, type TreeViewElement, File, Folder, CollapseButton} from './FileSystemTreeView'
import type {
  WarpDiveImage,
  WarpDiveImage_NodeTree,
  WarpDiveImage_NodeTree_Ref,
  WarpDiveImage_Node
} from '@/generated/warpdive_pb'
import {useLayer} from './useLayer'
import {useWarpImage} from './WarpImageProvider'

export interface FileSystemViewerProps {}

const FileSystemViewer = (props: FileSystemViewerProps) => {
  const {wpImage, setWpImage} = useWarpImage()
  const [layerState, setLayerState] = useLayer()

  if (!wpImage?.tree?.children) {
    return <span>No Data Found</span>
  }
  return (
    <Tree
      className='p- h-60 w-full overflow-clip rounded-md bg-background'
      indicator={true}
    >
      {wpImage.tree.children.map(
        (element, _) =>
          element.ref && (
            <TreeItem
              key={element.ref?.gid}
              elements={element.children}
              node={element.ref}
              indentLevel={0}
            />
          )
      )}
      {/* <CollapseButton
        elements={toc}
        expandAll={true}
      /> */}
    </Tree>
  )
}

export default FileSystemViewer

type TreeItemProps = {
  elements: WarpDiveImage_NodeTree[]
  node: WarpDiveImage_NodeTree_Ref | undefined
  indentLevel: number
}

export const TreeItem = ({elements, indentLevel, node}: TreeItemProps) => {
  if (!node || !elements) {
    return <>There was an error</>
  }
  return (
    <ul className={` w-full ${false && 'space-y-1'}`}>
      {elements.map((element) => (
        <li
          key={element.ref?.gid}
          className=' w-full' // space-y-2
          style={{lineHeight: 0}}
        >
          {element.ref && element.children && element.children?.length > 0 ? (
            <Folder
              element={element.ref.gid}
              value={node?.gid}
              isSelectable={false}
              className='' //px-px pr-1
              indentLevel={indentLevel}
            >
              <TreeItem
                key={element.ref.gid}
                elements={element.children}
                indentLevel={indentLevel + 1}
                node={}
              />
            </Folder>
          ) : (
            <File
              key={element.id}
              value={element.id}
              isSelectable={element.isSelectable}
              elementName={element?.name}
              indentLevel={indentLevel}
            ></File>
          )}
        </li>
      ))}
    </ul>
  )
}

// const TOCWrapper = () => {
//   const toc = [
//     {
//       id: '1',
//       name: 'components',
//       children: [
//         {
//           id: '2',
//           name: 'extension',
//           children: [
//             {
//               id: '3',
//               name: 'tree-view.tsx'
//             },
//             {
//               id: '4',
//               name: 'tree-view-api.tsx'
//             }
//           ]
//         },
//         {
//           id: '5',
//           name: 'dashboard-tree.tsx'
//         }
//       ]
//     },
//     {
//       id: '6',
//       name: 'pages',
//       children: [
//         {
//           id: '7',
//           name: 'page.tsx'
//         },
//         {
//           id: '8',
//           name: 'page-guide.tsx'
//         }
//       ]
//     },
//     {
//       id: '18',
//       name: 'env.ts'
//     }
//   ]
//   return <TOC toc={toc} />
// }

// export default TOCWrapper
