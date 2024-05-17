import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
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

// import {type SettingsPageProps, SettingsLayout} from '../layout'

export interface LayerBrowserProps {
  binaryPath?: string
}

// export interface SettingsUserAccountProps extends SettingsPageProps {
// user: AppUser
// }

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

        if (anyPb.typeUrl === 'type.googleapis.com/warpdive.WarpDiveImage') {
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

    // Accessing the first root node's children safely
    // const rootChildren = wpImage.tree.children[0]?.children // Optional chaining in case children[0] is undefined
    // if (!rootChildren) {
    //   return []
    // }

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
            <div className='flex-1 bg-white p-4 dark:bg-gray-950 md:p-6'>
              <div className='mb-4 flex items-center justify-between'>
                <h2 className='text-lg font-semibold'>Entry Details</h2>
                <div className='flex items-center gap-4'>
                  <Button
                    size='sm'
                    variant='outline'
                  >
                    <DownloadIcon className='mr-2 h-4 w-4' />
                    Export
                  </Button>
                  <Button
                    size='sm'
                    variant='outline'
                  >
                    {/* <DeleteIcon className='mr-2 h-4 w-4' /> */}
                    Edit
                  </Button>
                </div>
              </div>
              <div className='grid gap-6'>
                <div className='grid gap-2'>
                  <div className='text-sm font-medium text-gray-500 dark:text-gray-400'>Invoice</div>
                  <div className='text-lg font-semibold'>INV001</div>
                </div>
                <div className='grid gap-2'>
                  <div className='text-sm font-medium text-gray-500 dark:text-gray-400'>Customer</div>
                  <div className='text-lg font-semibold'>Jared Palmer</div>
                </div>
                <div className='grid gap-2'>
                  <div className='text-sm font-medium text-gray-500 dark:text-gray-400'>Status</div>
                  <div className='rounded-full bg-green-500 px-3 py-1 text-xs font-medium text-white'>Paid</div>
                </div>
                <div className='grid gap-2'>
                  <div className='text-sm font-medium text-gray-500 dark:text-gray-400'>Amount</div>
                  <div className='text-lg font-semibold'>$250.00</div>
                </div>
                <div className='grid gap-2'>
                  <div className='text-sm font-medium text-gray-500 dark:text-gray-400'>Payment Method</div>
                  <div className='text-lg font-semibold'>Credit Card</div>
                </div>
                <div className='grid gap-2'>
                  <div className='text-sm font-medium text-gray-500 dark:text-gray-400'>Date</div>
                  <div className='text-lg font-semibold'>2023-05-01</div>
                </div>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </>
  )
}

export default LayerBrowser
