import {cn} from '@/lib/utils'
import {Button, buttonVariants} from '@/components/ui/button'

import {ToggleGroup, ToggleGroupItem} from '@/components/ui/toggle-group'
import {Diff, Layers} from 'lucide-react'

export function LayerListToolbar() {
  return (
    <div className='w-full border-b border-border/40 bg-background/95'>
      <div className='flex h-10 items-center px-4'>
        <div className=' flex'>
          <ToggleGroup
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
          </ToggleGroup>
        </div>
        <div className='flex flex-1 items-center justify-end space-x-2'>
          <Button
            variant={'outline'}
            size={'sm'}
          >
            <Layers className='mr-1 h-4 w-4' />
            <span>Show Aggregated Changes</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
