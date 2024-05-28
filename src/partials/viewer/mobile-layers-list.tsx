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
// import {MobileToolbar} from './mobile-toolbar'

// const data = [
//   {
//     goal: 400
//   },
//   {
//     goal: 300
//   },
//   {
//     goal: 200
//   },
//   {
//     goal: 300
//   },
//   {
//     goal: 200
//   },
//   {
//     goal: 278
//   },
//   {
//     goal: 189
//   },
//   {
//     goal: 239
//   },
//   {
//     goal: 300
//   },
//   {
//     goal: 200
//   },
//   {
//     goal: 278
//   },
//   {
//     goal: 189
//   },
//   {
//     goal: 349
//   }
// ]

export interface MobileLayersList {}

export function MobileLayersList(props: PropsWithChildren<MobileLayersList>) {
  // const [goal, setGoal] = React.useState(350)

  // function onClick(adjustment: number) {
  //   setGoal(Math.max(200, Math.min(400, goal + adjustment)))
  // }

  return (
    <Drawer direction='left'>
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
        <div className='mx-auto w-full max-w-sm'>
          {props.children}
          {/* <DrawerHeader>
            <DrawerTitle>Move Goal</DrawerTitle>
            <DrawerDescription>Set your daily activity goal.</DrawerDescription>
          </DrawerHeader> */}
          {/* <div className='p-4 pb-0'>
            <div className='flex items-center justify-center space-x-2'>
              <Button
                variant='outline'
                size='icon'
                className='h-8 w-8 shrink-0 rounded-full'
                onClick={() => onClick(-10)}
                disabled={goal <= 200}
              >
                <Minus className='h-4 w-4' />
                <span className='sr-only'>Decrease</span>
              </Button>
              <div className='flex-1 text-center'>
                <div className='text-7xl font-bold tracking-tighter'>{goal}</div>
                <div className='text-[0.70rem] uppercase text-muted-foreground'>Calories/day</div>
              </div>
              <Button
                variant='outline'
                size='icon'
                className='h-8 w-8 shrink-0 rounded-full'
                onClick={() => onClick(10)}
                disabled={goal >= 400}
              >
                <Plus className='h-4 w-4' />
                <span className='sr-only'>Increase</span>
              </Button>
            </div>
            <div className='mt-3 h-[120px]'></div>
          </div> */}
          {/* <DrawerFooter>
            <Button>Submit</Button>
            <DrawerClose asChild>
              <Button variant='outline'>Cancel</Button>
            </DrawerClose>
          </DrawerFooter> */}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
