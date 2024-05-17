import React, {createContext, useContext, useState, useMemo, type ReactNode} from 'react'

// Assuming WarpDiveImage type is imported or defined somewhere
import {WarpDiveImage} from '@/generated/warpdive_pb'

interface WarpImageContextType {
  wpImage: WarpDiveImage | null
  setWpImage: (image: WarpDiveImage) => void
}

const WarpImageContext = createContext<WarpImageContextType | undefined>(undefined)

interface WarpImageProviderProps {
  children: ReactNode
}

export const WarpImageProvider: React.FC<WarpImageProviderProps> = ({children}) => {
  const [wpImage, setWpImage] = useState<WarpDiveImage | null>(null)

  const value = useMemo(() => ({wpImage, setWpImage}), [wpImage])

  return <WarpImageContext.Provider value={value}>{children}</WarpImageContext.Provider>
}

export const useWarpImage = (): WarpImageContextType => {
  const context = useContext(WarpImageContext)
  if (context === undefined) {
    throw new Error('useWarpImage must be used within a WarpImageProvider')
  }
  return context
}
