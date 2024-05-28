import {atom, useAtom} from 'jotai'
import {WarpDiveImage_TreeNode} from '@/generated/warpdive_pb'

type TreeNodeMap = Map<WarpDiveImage_TreeNode | null, string[]>
export const layerUiStateAtom = atom<TreeNodeMap>(new Map())

export function useSelectedLayerUiState(treeNode: WarpDiveImage_TreeNode | null): string[] | undefined {
  const [treeNodeMap] = useAtom(layerUiStateAtom)
  return treeNodeMap.get(treeNode)
}

// Hook to set labels for a specific TreeNode
export function useSetSelectedLayerUiState(): (treeNode: WarpDiveImage_TreeNode | null, globalIds: string[]) => void {
  const [, setTreeNodeMap] = useAtom(layerUiStateAtom)
  return (node: WarpDiveImage_TreeNode, labels: string[]) => {
    setTreeNodeMap((prevMap) => {
      const newMap = new Map(prevMap)
      newMap.set(node, labels)
      return newMap
    })
  }
}
