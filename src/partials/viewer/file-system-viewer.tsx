import {useEffect, useCallback} from 'react'
import {FixedSizeList as List, areEqual} from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import memoizeOne from 'memoize-one'
import {useWarpImage} from './warp-dive-image-provider'
import {useLayer} from './use-layer'
import type {WarpDiveImage_TreeNode} from '@/generated/warpdive_pb'
import {useSelectedLayerUiState, useSetSelectedLayerUiState} from './use-layer-ui-state'
import {useAtom} from 'jotai'
import {collapseDirsAtom, expandDirsAtom} from './toolbar-events-atoms'
import {type RowProps, Row} from './file-system-row'

export enum DefaultOpenOrCollapse {
  DefaultOpen = 1,
  DefaultCollapse = 2
}
export const DEFAULT_OPEN_OR_COLLAPSE: DefaultOpenOrCollapse = DefaultOpenOrCollapse.DefaultOpen

export interface TreeNodeItem {
  children: number
  collapsed: boolean
  depth: number
  gid: string
  open: boolean
}

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

  const dirGlobalIdsState = useSelectedLayerUiState(selectedLayer?.ref?.gid)
  const setDirGlobalIdsState = useSetSelectedLayerUiState()

  const [expandDirsEvent, setExpandDirsEvent] = useAtom(expandDirsAtom)
  const [collapseDirsEvent, setCollapseDirsEvent] = useAtom(collapseDirsAtom)

  useEffect(() => {
    if (expandDirsEvent && wpImage?.tree) {
      const allGids = collectAllGids(wpImage.tree)
      setDirGlobalIdsState(selectedLayer?.ref?.gid, allGids)
      setExpandDirsEvent(null)
    }
  }, [expandDirsEvent, setDirGlobalIdsState, collectAllGids, selectedLayer, wpImage?.tree, setExpandDirsEvent])

  useEffect(() => {
    if (collapseDirsEvent && wpImage?.tree) {
      const initialGids = collectNodesToDepth(wpImage.tree)
      setDirGlobalIdsState(selectedLayer?.ref?.gid, initialGids)
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
    // console.log('setting open', dirGlobalIdsState)
    if (dirGlobalIdsState) {
      if (DEFAULT_OPEN_OR_COLLAPSE === DefaultOpenOrCollapse.DefaultOpen) {
        if (node.open) {
          setDirGlobalIdsState(
            selectedLayer.ref?.gid,
            dirGlobalIdsState.filter((gid) => gid !== node.gid)
          )
        } else {
          setDirGlobalIdsState(selectedLayer.ref?.gid, [...dirGlobalIdsState, node.gid])
        }
      } else if (DEFAULT_OPEN_OR_COLLAPSE === DefaultOpenOrCollapse.DefaultCollapse) {
        if (node.collapsed) {
          setDirGlobalIdsState(
            selectedLayer.ref?.gid,
            dirGlobalIdsState.filter((gid) => gid !== node.gid)
          )
        } else {
          setDirGlobalIdsState(selectedLayer.ref?.gid, [...dirGlobalIdsState, node.gid])
        }
      }
    }
  }

  const onSelect: RowProps['data']['onSelect'] = (e, node) => {
    // console.log('select', e, node)
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
