import React, {createContext, useContext, useState, useMemo, type ReactNode} from 'react'

// Assuming WarpDiveImage type is imported or defined somewhere
import {WarpDiveImage} from '@/generated/warpdive_pb'

interface WarpDiveImageContextType {
  wpImage: WarpDiveImage | null
  setWpImage: (image: WarpDiveImage) => void
}

const WarpDiveImageContext = createContext<WarpDiveImageContextType | undefined>(undefined)

interface WarpImageProviderProps {
  children: ReactNode
}

export const WarpDiveImageProvider: React.FC<WarpImageProviderProps> = ({children}) => {
  const [wpImage, setWpImage] = useState<WarpDiveImage | null>(null)

  const value = useMemo(() => ({wpImage, setWpImage}), [wpImage])

  return <WarpDiveImageContext.Provider value={value}>{children}</WarpDiveImageContext.Provider>
}

export const useWarpImage = (): WarpDiveImageContextType => {
  const context = useContext(WarpDiveImageContext)
  if (context === undefined) {
    throw new Error('useWarpImage must be used within a WarpImageProvider')
  }
  return context
}
