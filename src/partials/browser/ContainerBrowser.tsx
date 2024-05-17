import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import FileSystemViewer from './FileSystemViewer'
import Link from '@/components/Link'
import {Button} from '@/components/ui/button'
import {PlusIcon, ChevronRightIcon, DownloadIcon} from '@radix-ui/react-icons'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import {Any} from '@/generated/google/protobuf/any_pb'
import {WarpDiveImage, Node as WarpDiveNode} from '@/generated/warpdive_pb'
import {useWarpImage} from './WarpImageProvider'

import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from '@/components/ui/resizable'
import {useState, useEffect, type FC} from 'react'
import LayerRow from './LayerRow'
import LayersList from './LayersList'
import {ScrollArea} from '@/components/ui/scroll-area'
import {WARP_DIVE_IMAGE_TYPE_URL} from '@/strings'

export interface LayerBrowserProps {
  binaryPath?: string
}

const LayerBrowser: FC<LayerBrowserProps> = ({binaryPath}) => {
  const {wpImage, setWpImage} = useWarpImage()
  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAndProcessBinary() {
      if (!binaryPath) return
      setLoading(true)
      try {
        const response = await fetch(binaryPath)
        const arrayBuffer = await response.arrayBuffer()
        const binary = new Uint8Array(arrayBuffer)
        const anyPb = Any.fromBinary(binary)

        if (anyPb.typeUrl === WARP_DIVE_IMAGE_TYPE_URL) {
          const wpImageRead = WarpDiveImage.fromBinary(anyPb.value)
          console.log(wpImageRead.tree)
          setWpImage(wpImageRead)
        }
      } catch (err) {
        console.error('Error:', err)
        setError('Failed to load binary data.')
      } finally {
        setLoading(false)
      }
    }

    fetchAndProcessBinary()
  }, [binaryPath, setWpImage])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!wpImage) {
    return <div>Unknown Error</div>
  }

  // Function to get layers from the first root node
  const getLayersFromRoot = (): WarpDiveNode[] => {
    // Ensure wpImage and wpImage.tree exist and have the needed properties
    if (!wpImage || !wpImage.tree || !wpImage.tree.children || wpImage.tree.children.length === 0) {
      return []
    }

    // Map each child to a node using the ref's gid, and filter nodes that are defined and are layers
    return wpImage.tree.children
      .map((child) => (child.ref ? wpImage.nodes[child.ref.gid] : undefined)) // Using ternary operator for clearer intent
      .filter((node): node is WarpDiveNode => node !== undefined && node.data.oneofKind === 'layer') // Using type guard in filter
  }

  const layers = getLayersFromRoot()

  console.log('root layers: ', layers)

  // Function to get a node by gid
  const getNodeByGid = (gid: number) => {
    return wpImage ? wpImage.nodes[gid] : undefined
  }

  return (
    <>
      <header className='flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm dark:border-gray-800 dark:bg-gray-950 md:px-6'>
        <div className='flex items-center gap-4'>
          <Link
            className='text-lg font-semibold'
            href='#'
          >
            Acme Inc
          </Link>
          <div className='hidden items-center gap-4 md:flex'>
            <Button
              size='sm'
              variant='ghost'
            >
              All
            </Button>
            <Button
              size='sm'
              variant='ghost'
            >
              Pending
            </Button>
            <Button
              size='sm'
              variant='ghost'
            >
              Completed
            </Button>
            <Button
              size='sm'
              variant='ghost'
            >
              Archived
            </Button>
          </div>
        </div>
        <div className='flex items-center gap-4'>
          <div className='hidden md:block'>
            <Input
              className='max-w-xs'
              placeholder='Search entries...'
              type='search'
            />
          </div>
          <Button
            className='rounded-full'
            size='icon'
            variant='ghost'
          >
            <img
              alt='Avatar'
              className='rounded-full'
              height='32'
              src='/placeholder.svg'
              style={{
                aspectRatio: '32/32',
                objectFit: 'cover'
              }}
              width='32'
            />
            <span className='sr-only'>Toggle user menu</span>
          </Button>
        </div>
      </header>
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
                      layer.data.oneofKind === 'layer' && (
                        <LayerRow
                          key={layer.gid}
                          gid={layer.gid}
                          layer={layer.data.layer}
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
