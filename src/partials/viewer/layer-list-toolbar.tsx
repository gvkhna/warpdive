import {ShareDropdown} from './share-dropdown'

export interface LayerListToolbarProps {
  appViewer?: boolean
  pid?: string
}

export function LayerListToolbar({appViewer = false, pid}: LayerListToolbarProps) {
  return (
    <div className='w-full border-b border-border/40 bg-background/95'>
      <div className='flex h-10 items-center px-4'>
        <div className=' flex'>
          {/* <ToggleGroup
            size={'sm'}
            type='single'
          >
            <ToggleGroupItem
              value='bold'
              className=' whitespace-nowrap'
              aria-label='Toggle bold'
            >
              <Diff className='mr-1 h-4 w-4' />
              <span>Show Layer Change</span>
            </ToggleGroupItem>
          </ToggleGroup> */}
        </div>
        <div className='flex flex-1 items-center justify-end space-x-2'>
          {pid && <ShareDropdown pid={pid} />}

          {/* <Button
            variant={'outline'}
            size={'sm'}
          >
            <Layers className='mr-1 h-4 w-4' />
            <span>Show Aggregated Changes</span>
          </Button> */}
        </div>
      </div>
    </div>
  )
}
