import React, {useState, memo, type MouseEvent, useEffect, useCallback} from 'react'
import {FixedSizeList as List, areEqual} from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import memoizeOne from 'memoize-one'
import {useWarpImage} from './warp-dive-image-provider'
import {useLayer} from './use-layer'
import {WarpDiveImage_FileNode_FileType} from '@/generated/warpdive_pb'
import type {WarpDiveImage_TreeNode} from '@/generated/warpdive_pb'
import {ArrowRight, FileIcon, FolderIcon, FolderOpenIcon} from 'lucide-react'
import {formatBytesString} from './format-byte-size'
import {formatFilePermissionsMode} from './format-permissions'
import {useSelectedLayerUiState, useSetSelectedLayerUiState} from './use-layer-ui-state'
import {useAtom} from 'jotai'
import {collapseDirsAtom, expandDirsAtom} from './toolbar-events-atoms'

enum DefaultOpenOrCollapse {
  DefaultOpen = 1,
  DefaultCollapse = 2
}
const DEFAULT_OPEN_OR_COLLAPSE: DefaultOpenOrCollapse = DefaultOpenOrCollapse.DefaultOpen

interface TreeNodeItem {
  children: number
  collapsed: boolean
  depth: number
  gid: string
  open: boolean
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

  const folderOpenClosedIcon = () => {
    if (DEFAULT_OPEN_OR_COLLAPSE === DefaultOpenOrCollapse.DefaultOpen) {
      if (node.open) {
        return <FolderOpenIcon className='mr-1 h-4 w-4' />
      } else {
        return <FolderIcon className='mr-1 h-4 w-4' />
      }
    } else if (DEFAULT_OPEN_OR_COLLAPSE === DefaultOpenOrCollapse.DefaultCollapse) {
      if (node.collapsed) {
        return <FolderIcon className='mr-1 h-4 w-4' />
      } else {
        return <FolderOpenIcon className='mr-1 h-4 w-4' />
      }
    }
  }

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
          className='grid text-nowrap pl-1 font-mono'
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
                {folderOpenClosedIcon()}
                <span className='font-semibold'>{name}</span>
              </>
            ) : (
              <>
                <FileIcon className='mr-1 h-4 w-4' />
                <span className='font-normal'>{name}</span>
              </>
            )}
            {fsLinkname && (
              <span>
                <ArrowRight className='mx-2 inline-block h-3 w-3' />
                {fsLinkname}
              </span>
            )}
            {/* {fsLinkname && <span>&nbsp;-&gt;&nbsp;{fsLinkname}</span>} */}
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
  const {wpImage, setWpImage} = useWarpImage()
  const [layerState, setLayerState] = useLayer()

  const collectAllGids = useCallback((node: WarpDiveImage_TreeNode) => {
    let gids: string[] = []
    if (node.ref?.gid) {
      gids.push(node.ref.gid)
    }

    if (node.children) {
      node.children.forEach((child) => {
        gids = gids.concat(collectAllGids(child))
      })
    }

    return gids
  }, [])

  const collectNodesToDepth = useCallback((node: WarpDiveImage_TreeNode | undefined, currentDepth = 1) => {
    const MAX_DEPTH = 4
    let nodes: string[] = []

    if (!node || currentDepth > MAX_DEPTH) {
      return nodes
    }

    if (node.ref?.gid) {
      nodes.push(node.ref.gid)
    }

    if (node.children && currentDepth < MAX_DEPTH) {
      node.children.forEach((child) => {
        nodes = nodes.concat(collectNodesToDepth(child, currentDepth + 1))
      })
    }

    return nodes
  }, [])

  const selectedLayer = layerState.selectedLayer

  const dirGlobalIdsState = useSelectedLayerUiState(selectedLayer)
  const setDirGlobalIdsState = useSetSelectedLayerUiState()

  const [expandDirsEvent, setExpandDirsEvent] = useAtom(expandDirsAtom)
  const [collapseDirsEvent, setCollapseDirsEvent] = useAtom(collapseDirsAtom)

  useEffect(() => {
    if (expandDirsEvent && wpImage?.tree) {
      const allGids = collectAllGids(wpImage.tree)
      setDirGlobalIdsState(selectedLayer, allGids)
      setExpandDirsEvent(null)
    }
  }, [expandDirsEvent, setDirGlobalIdsState, collectAllGids, selectedLayer, wpImage?.tree, setExpandDirsEvent])

  useEffect(() => {
    if (collapseDirsEvent && wpImage?.tree) {
      const initialGids = collectNodesToDepth(wpImage.tree)
      setDirGlobalIdsState(selectedLayer, initialGids)
      setCollapseDirsEvent(null)
    }
  }, [collapseDirsEvent, setDirGlobalIdsState, selectedLayer, wpImage?.tree, setCollapseDirsEvent, collectNodesToDepth])

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
    let open = false
    let collapsed = false
    if (dirGlobalIdsState) {
      if (DEFAULT_OPEN_OR_COLLAPSE === DefaultOpenOrCollapse.DefaultOpen) {
        open = dirGlobalIdsState.includes(id)
      } else if (DEFAULT_OPEN_OR_COLLAPSE === DefaultOpenOrCollapse.DefaultCollapse) {
        collapsed = dirGlobalIdsState.includes(id)
      }
    }

    const gid = treeNode.ref?.gid

    if (!gid) {
      return
    }

    const node = {
      children: treeNode.children.length,
      collapsed,
      depth,
      gid,
      open
    }

    result.push(node)

    if (DEFAULT_OPEN_OR_COLLAPSE === DefaultOpenOrCollapse.DefaultOpen) {
      if (open && treeNode.children) {
        for (let child of treeNode.children) {
          flattenTreeNode(child, depth + 1, result)
        }
      }
    } else if (DEFAULT_OPEN_OR_COLLAPSE === DefaultOpenOrCollapse.DefaultCollapse) {
      if (!collapsed && treeNode.children) {
        for (let child of treeNode.children) {
          flattenTreeNode(child, depth + 1, result)
        }
      }
    }
  }

  const onOpen: RowProps['data']['onOpen'] = (node) => {
    console.log('setting open', dirGlobalIdsState)
    if (dirGlobalIdsState) {
      if (DEFAULT_OPEN_OR_COLLAPSE === DefaultOpenOrCollapse.DefaultOpen) {
        if (node.open) {
          setDirGlobalIdsState(
            selectedLayer,
            dirGlobalIdsState.filter((gid) => gid !== node.gid)
          )
        } else {
          setDirGlobalIdsState(selectedLayer, [...dirGlobalIdsState, node.gid])
        }
      } else if (DEFAULT_OPEN_OR_COLLAPSE === DefaultOpenOrCollapse.DefaultCollapse) {
        if (node.collapsed) {
          setDirGlobalIdsState(
            selectedLayer,
            dirGlobalIdsState.filter((gid) => gid !== node.gid)
          )
        } else {
          setDirGlobalIdsState(selectedLayer, [...dirGlobalIdsState, node.gid])
        }
      }
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
