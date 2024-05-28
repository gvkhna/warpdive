import {cn} from '@/lib/utils'
import {Button, buttonVariants} from '@/components/ui/button'

import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip'

import {ToggleGroup, ToggleGroupItem} from '@/components/ui/toggle-group'
import {ChevronsDownUp, ChevronsUpDown, FileCheck, FileDiff, FilePlus, FileSearch, FileX} from 'lucide-react'
import {useState} from 'react'
import {useAtom} from 'jotai'
import {collapseDirsAtom, expandDirsAtom} from './toolbar-events-atoms'

export function FileSystemViewerToolbar() {
  const [toggleValue, setToggleValue] = useState(['add', 'remove', 'mod', 'unmod'])
  const [, triggerCollapseDirsEvent] = useAtom(collapseDirsAtom)
  const [, triggerExpandDirsEvent] = useAtom(expandDirsAtom)
  return (
    <TooltipProvider>
      <div className='w-full border-b border-border/40 bg-background/95'>
        <div className='flex h-10 items-center px-4'>
          <div className='flex'>
            {/* <ToggleGroup
              value={toggleValue}
              onValueChange={(v) => setToggleValue(v)}
              variant='default'
              size={'sm'}
              type='multiple'
            >
              <ToggleGroupItem
                value='add'
                className='whitespace-nowrap'
                aria-label='Toggle bold'
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <FilePlus className='h-5 w-5' />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Show Added Files</p>
                  </TooltipContent>
                </Tooltip>
              </ToggleGroupItem>

              <ToggleGroupItem
                value='remove'
                className='whitespace-nowrap'
                aria-label='Toggle bold'
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <FileX className='h-5 w-5' />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Show Removed Files</p>
                  </TooltipContent>
                </Tooltip>
              </ToggleGroupItem>
              <ToggleGroupItem
                value='mod'
                className='whitespace-nowrap'
                aria-label='Toggle bold'
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <FileDiff className='h-5 w-5' />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Show Modified Files</p>
                  </TooltipContent>
                </Tooltip>
              </ToggleGroupItem>
              <ToggleGroupItem
                value='unmod'
                className=' whitespace-nowrap'
                aria-label='Toggle bold'
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <FileCheck className='h-5 w-5' />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Show Unmodified Files</p>
                  </TooltipContent>
                </Tooltip>
              </ToggleGroupItem>
            </ToggleGroup> */}
          </div>
          <div className='flex flex-1 items-center justify-end space-x-2'>
            <Button
              variant={'outline'}
              size={'sm'}
              onClick={(e) => {
                triggerCollapseDirsEvent(new Date())
              }}
            >
              <ChevronsDownUp className='mr-1 h-4 w-4' />
              <span>Collapse Dirs</span>
            </Button>
            <Button
              variant={'outline'}
              size={'sm'}
              onClick={(e) => {
                triggerExpandDirsEvent(new Date())
              }}
            >
              <ChevronsUpDown className='mr-1 h-4 w-4' />
              <span>Expand Dirs</span>
            </Button>
            {/* <Button
              variant={'outline'}
              size={'sm'}
            >
              <FileSearch className='mr-1 h-4 w-4' />
              <span>Search</span>
            </Button> */}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
