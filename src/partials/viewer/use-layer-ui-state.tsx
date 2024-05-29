import {atom, useAtom} from 'jotai'
import {WarpDiveImage_TreeNode} from '@/generated/warpdive_pb'

export type TreeNodeMap = Map<string | null | undefined, string[]>
export const layerUiStateAtom = atom<TreeNodeMap>(new Map())

export function useSelectedLayerUiState(treeNodeGid: string | null | undefined): string[] | undefined {
  const [treeNodeMap] = useAtom(layerUiStateAtom)
  return treeNodeMap.get(treeNodeGid)
}

// Hook to set labels for a specific TreeNode
export function useSetSelectedLayerUiState(): (treeNodeGid: string | null | undefined, globalIds: string[]) => void {
  const [, setTreeNodeMap] = useAtom(layerUiStateAtom)
  return (node: string, labels: string[]) => {
    setTreeNodeMap((prevMap) => {
      const newMap = new Map(prevMap)
      newMap.set(node, labels)
      return newMap
    })
  }
}
