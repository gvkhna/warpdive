// Import the necessary Jotai functionalities
import {atom, useAtom} from 'jotai'

// Initialize the atom with a default value, for example null if no layer is selected initially
const drawerOpenAtom = atom<boolean>(false)

// Custom hook to use the layer state
export function useDrawerOpen() {
  return useAtom(drawerOpenAtom)
}
