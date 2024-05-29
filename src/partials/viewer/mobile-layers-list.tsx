// import {Minus, Plus} from 'lucide-react'

import {Button} from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '@/components/ui/drawer'
import {PropsWithChildren} from 'react'
import {useDrawerOpen} from './use-drawer-open'

export interface MobileLayersList {}

export function MobileLayersList(props: PropsWithChildren<MobileLayersList>) {
  const [isDrawerOpen, setDrawerOpen] = useDrawerOpen()

  return (
    <Drawer
      direction='left'
      open={isDrawerOpen}
      onOpenChange={(val) => {
        setDrawerOpen(val)
      }}
    >
      <div className='w-full border-b border-border/40 bg-background/95'>
        <div className='flex h-10 items-center  px-4'>
          <div className=' flex '>
            <DrawerTrigger asChild>
              <Button
                variant={'outline'}
                size={'sm'}
              >
                Show Layers
              </Button>
            </DrawerTrigger>
          </div>
          <div className='flex flex-1 items-center justify-end space-x-2'></div>
        </div>
      </div>

      <DrawerContent
        showBar={false}
        className=' mt-0 h-full w-11/12 rounded-none'
      >
        <div className='mx-auto w-full max-w-sm'>{props.children}</div>
      </DrawerContent>
    </Drawer>
  )
}
