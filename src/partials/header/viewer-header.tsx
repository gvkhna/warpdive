import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import Link from '@/components/link'
import {Button} from '@/components/ui/button'

export default function ViewerHeader() {
  return (
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
  )
}
