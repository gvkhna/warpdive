import {ChevronRightIcon} from '@radix-ui/react-icons'
export default function Breadcrumbs() {
  return (
    <div className='mb-4 flex items-center space-x-1 text-sm text-muted-foreground'>
      <div className='overflow-hidden text-ellipsis whitespace-nowrap'>Dashboard</div>
      <ChevronRightIcon className='h-4 w-4' />
      <div className='font-medium text-foreground'>Projects</div>
    </div>
  )
}
