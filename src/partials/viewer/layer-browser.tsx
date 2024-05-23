import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import Link from '@/components/link'
import {Button} from '@/components/ui/button'
import {PlusIcon, ChevronRightIcon, DownloadIcon} from '@radix-ui/react-icons'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import {Any} from '@/generated/google/protobuf/any_pb'
import {WarpDiveImage, WarpDiveImage_Node, WarpDiveImage_TreeNode} from '@/generated/warpdive_pb'
import {useWarpImage} from './warp-dive-image-provider'

import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from '@/components/ui/resizable'
import {useState, useEffect, type FC} from 'react'
import LayerRow from './layer-row'
import LayersList from './layers-list'
import {ScrollArea} from '@/components/ui/scroll-area'
import {Timestamp} from '@/generated/google/protobuf/timestamp_pb'
import FileSystemViewer from './file-system-viewer'

export interface LayerBrowserProps {
  binary: Uint8Array
  onError: (e: Error) => void
}

const LayerBrowser: FC<LayerBrowserProps> = ({binary, onError}) => {
  const {wpImage, setWpImage} = useWarpImage()
  const [isLoading, setLoading] = useState(false)

  useEffect(() => {
    function processBinary() {
      if (!binary) return
      setLoading(true)
      try {
        const anyPb = Any.fromBinary(binary, {})
        if (Any.contains(anyPb, WarpDiveImage)) {
          const wpImageRead = Any.unpack(anyPb, WarpDiveImage)
          console.log(wpImageRead.tree)
          console.log(wpImageRead.nodes)
          console.log(wpImageRead.metadata)
          if (wpImageRead.metadata?.ts) {
            const d = Timestamp.toDate(wpImageRead.metadata?.ts)
            console.log(d.toString())
          }
          setWpImage(wpImageRead)
        }
      } catch (err) {
        console.error('Error parsing file:', err)
        onError(new Error('Failed to load binary. The file is not a valid `.warpdive` binary.'))
      } finally {
        setLoading(false)
      }
    }

    processBinary()
  }, [binary, setWpImage, onError])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!wpImage) {
    return <div>Unknown Error</div>
  }

  // Function to get layers from the first root node
  const getLayersFromRoot = (): WarpDiveImage_TreeNode[] => {
    // Ensure wpImage and wpImage.tree exist and have the needed properties
    if (!wpImage || !wpImage.tree || !wpImage.tree.children || wpImage.tree.children.length === 0) {
      return []
    }
    return wpImage.tree.children
  }

  const layers = getLayersFromRoot()

  console.log('root layers: ', layers)

  // Function to get a node by gid
  const getNodeByGid = (gid: number) => {
    return wpImage ? wpImage.nodes[gid] : undefined
  }

  return (
    <>
      <div className='flex h-[calc(100vh_-_theme(spacing.16))] w-full'>
        <ResizablePanelGroup direction='horizontal'>
          <ResizablePanel defaultSize={40}>
            <div className=' bg-white dark:border-gray-800 dark:bg-gray-950'>
              {/* <div className='mb-4 flex items-center justify-between'>
                <h2 className='text-lg font-semibold'>Layers</h2>
              </div> */}
              <ScrollArea className=' h-[calc(100vh_-_theme(spacing.16))]'>
                <LayersList>
                  {layers.map(
                    (layer) =>
                      layer.ref?.gid && (
                        <LayerRow
                          key={layer.ref.gid}
                          treeNode={layer}
                        />
                      )
                  )}
                </LayersList>
              </ScrollArea>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel>
            <FileSystemViewer />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </>
  )
}

export default LayerBrowser
