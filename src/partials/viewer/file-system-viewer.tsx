import React, {useState, memo, type MouseEvent} from 'react'
import {FixedSizeList as List, areEqual} from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import memoizeOne from 'memoize-one'
import {useWarpImage} from './warp-dive-image-provider'
import {useLayer} from './use-layer'
import {WarpDiveImage_FileNode_FileType} from '@/generated/warpdive_pb'
import type {WarpDiveImage_TreeNode} from '@/generated/warpdive_pb'
import {FileIcon, FolderIcon, FolderOpenIcon} from 'lucide-react'
import {formatBytesString} from './format-numbers'
import {formatFilePermissionsMode} from './format-permissions'

interface TreeNodeItem {
  collapsed: boolean
  depth: number
  children: number
  gid: string
}

interface RowProps {
  index: number
  style: any // css position abs, w, h, l, r, etc...
  data: {
    flattenedData: TreeNodeItem[]
    onOpen: (node: TreeNodeItem) => void
    onSelect: (e: MouseEvent<HTMLDivElement, globalThis.MouseEvent> | undefined, node: TreeNodeItem) => void
  }
}

function fileTypeToChar(type: WarpDiveImage_FileNode_FileType): string {
  switch (type) {
    case WarpDiveImage_FileNode_FileType.DIRECTORY:
      return 'd'
    case WarpDiveImage_FileNode_FileType.SYMLINK:
      return 'l'
    case WarpDiveImage_FileNode_FileType.CHARACTER_DEVICE:
      return 'c'
    case WarpDiveImage_FileNode_FileType.BLOCK_DEVICE:
      return 'b'
    case WarpDiveImage_FileNode_FileType.FIFO:
      return 'p'
    case WarpDiveImage_FileNode_FileType.REGULAR:
    case WarpDiveImage_FileNode_FileType.HARD_LINK:
    case WarpDiveImage_FileNode_FileType.CONTIGUOUS_FILE:
    case WarpDiveImage_FileNode_FileType.EXTENDED_HEADER:
    case WarpDiveImage_FileNode_FileType.GLOBAL_EXTENDED_HEADER:
    case WarpDiveImage_FileNode_FileType.GNU_SPARSE_FILE:
    case WarpDiveImage_FileNode_FileType.GNU_LONG_FILENAME:
    case WarpDiveImage_FileNode_FileType.GNU_LONG_LINKNAME:
      return '-'
    case WarpDiveImage_FileNode_FileType.UNKNOWN:
    default:
      return '?'
  }
}

function readPermissionString(mode: number, type: WarpDiveImage_FileNode_FileType) {
  const typeChar = fileTypeToChar(type)
  const permissions = formatFilePermissionsMode(mode)
  return typeChar + permissions
}

const Row = memo(({data, index, style}: RowProps) => {
  // console.log('row - ', data, index, style)
  const {flattenedData, onOpen, onSelect} = data
  const node = flattenedData[index]
  const left = node.depth * 20

  const {wpImage, setWpImage} = useWarpImage()
  const wpImageNodes = wpImage?.nodes

  if (!wpImageNodes) {
    return <>No Data Found</>
  }

  const currentNode = wpImageNodes[node.gid]

  const name =
    currentNode.data.oneofKind === 'fileNode'
      ? currentNode.data.fileNode.name || '<N/A>'
      : currentNode.data.oneofKind === 'fileTree'
        ? currentNode.data.fileTree.name
        : currentNode.data.oneofKind === 'layer'
          ? `Layer #${currentNode.data.layer.index}`
          : '<N/A>'

  const isFolder =
    (currentNode.data.oneofKind === 'fileNode' &&
      (currentNode.data.fileNode.nodeData?.fileInfo?.typeFlag === WarpDiveImage_FileNode_FileType.DIRECTORY ||
        currentNode.data.fileNode.childrenRefs.length > 0)) ||
    currentNode.data.oneofKind === 'fileTree' ||
    currentNode.data.oneofKind === 'layer'

  const fsPerm =
    currentNode.data.oneofKind === 'fileNode'
      ? currentNode.data.fileNode.nodeData?.fileInfo?.mode !== undefined
        ? readPermissionString(
            currentNode.data.fileNode.nodeData?.fileInfo?.mode,
            currentNode.data.fileNode.nodeData?.fileInfo?.typeFlag
          )
        : ''
      : ''

  const fsUid = currentNode.data.oneofKind === 'fileNode' ? currentNode.data.fileNode.nodeData?.fileInfo?.uid + '' : ''
  const fsGid = currentNode.data.oneofKind === 'fileNode' ? currentNode.data.fileNode.nodeData?.fileInfo?.gid + '' : ''
  const fsSize =
    currentNode.data.oneofKind === 'fileNode'
      ? currentNode.data.fileNode.size
      : currentNode.data.oneofKind === 'fileTree'
        ? currentNode.data.fileTree.fileSize
        : ''

  const fsLinkname = currentNode.data.oneofKind === 'fileNode' && currentNode.data.fileNode.nodeData?.fileInfo?.linkname

  return (
    <div
      className=' flex cursor-default font-mono text-sm hover:bg-slate-100'
      style={style}
      onClick={() => onOpen(node)}
    >
      <div
        className={`flex items-center`}
        onClick={(e) => onSelect(e, node)}
      >
        <div
          className='grid text-nowrap font-mono'
          style={{
            gridTemplateColumns: 'minmax(6rem, 6rem) minmax(4rem, auto) minmax(4rem, auto) 1fr'
          }}
        >
          <div className='col-span-1 text-left '>{fsPerm}</div>
          <div className='col-span-1 text-center'>{(fsUid && fsGid && `${fsUid}:${fsGid}`) || ''}</div>
          <div className='col-span-1 text-center'>{formatBytesString(fsSize)}</div>
          <div className='col-span-1 flex items-center text-left'>
            {'\xa0'.repeat(node.depth)}
            {isFolder ? (
              <>
                {node.collapsed ? <FolderIcon className='mr-1 h-4 w-4' /> : <FolderOpenIcon className='mr-1 h-4 w-4' />}
                <span className='font-semibold'>{name}</span>
              </>
            ) : (
              <>
                <FileIcon className='mr-1 h-4 w-4' />
                <span className='font-normal'>{name}</span>
              </>
            )}
            {fsLinkname && <span>&nbsp;-&gt;&nbsp;{fsLinkname}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}, areEqual)
Row.displayName = 'Row'

const getMemoizedItemContext = memoizeOne((onOpen, onSelect, flattenedData) => ({
  onOpen,
  onSelect,
  flattenedData
}))

const FileSystemViewer = () => {
  const [openedNodeIds, setOpenedNodeIds] = useState<string[]>([])
  const [collapsedGlobalIds, setCollapsedGlobalIds] = useState<string[]>([])

  const {wpImage, setWpImage} = useWarpImage()
  const [layerState, setLayerState] = useLayer()

  // console.log('reloading file system viewer')

  const selectedLayer = layerState.selectedLayer
  if (!selectedLayer) {
    return <span>No selected layer found!</span>
  }
  const currentNodeGid = selectedLayer.ref?.gid
  if (!wpImage || !wpImage.tree || !wpImage.nodes || !layerState || !currentNodeGid) {
    return <span>No Data Found</span>
  }

  const currentNode = wpImage.nodes[currentNodeGid]

  if (currentNode.data.oneofKind !== 'layer') {
    return <span>Didn&apos;t select a layer</span>
  }

  // const flattenOpened = (treeData: SpeedTreeData[]) => {
  //   const result: SpeedTreeItem[] = []
  //   for (let node of data) {
  //     flattenNode(node, 1, result)
  //   }
  //   return result
  // }

  const flattenTree = (treeNode: WarpDiveImage_TreeNode) => {
    const result: TreeNodeItem[] = []
    flattenTreeNode(treeNode, 1, result)
    return result
  }

  const flattenTreeNode = (treeNode: WarpDiveImage_TreeNode, depth: number, result: TreeNodeItem[]) => {
    const id = treeNode.ref?.gid + ''
    let collapsed = collapsedGlobalIds.includes(id)
    const gid = treeNode.ref?.gid

    if (!gid) {
      return
    }

    result.push({
      gid: gid,
      children: treeNode.children.length,
      depth,
      collapsed
    })

    if (!collapsed && treeNode.children) {
      for (let child of treeNode.children) {
        flattenTreeNode(child, depth + 1, result)
      }
    }
  }

  const onOpen: RowProps['data']['onOpen'] = (node) => {
    if (node.collapsed) {
      setCollapsedGlobalIds(collapsedGlobalIds.filter((gid) => gid !== node.gid))
    } else {
      setCollapsedGlobalIds([...collapsedGlobalIds, node.gid])
    }
  }

  const onSelect: RowProps['data']['onSelect'] = (e, node) => {
    console.log('select', e, node)
    //e.stopPropagation();
  }

  const flattenedData = flattenTree(selectedLayer)

  // console.log('flat', flattenedData)
  const memoizedItemContextData = getMemoizedItemContext(onOpen, onSelect, flattenedData)

  return (
    <AutoSizer>
      {({height, width}) => (
        <List
          className='List'
          height={height}
          itemCount={flattenedData.length}
          itemSize={24}
          width={width}
          itemKey={(index) => flattenedData[index].gid}
          itemData={memoizedItemContextData}
        >
          {Row}
        </List>
      )}
    </AutoSizer>
  )
}

export default FileSystemViewer
