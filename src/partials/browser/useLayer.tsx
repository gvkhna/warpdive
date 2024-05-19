// Import the necessary Jotai functionalities
import {atom, useAtom} from 'jotai'
import {WarpDiveImage_TreeNode} from '@/generated/warpdive_pb'

type LayerState = {
  selectedLayer: WarpDiveImage_TreeNode | null // Assuming 'gid' is of a suitable type like string or number
}

// Initialize the atom with a default value, for example null if no layer is selected initially
const layerStateAtom = atom<LayerState>({
  selectedLayer: null
})

// Custom hook to use the layer state
export function useLayer() {
  return useAtom(layerStateAtom)
}
