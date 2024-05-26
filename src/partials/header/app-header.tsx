import Link from '@/components/link'
import {cn} from '@/lib/utils'
import {Icons} from './icons'
import {buttonVariants} from '@/components/ui/button'
import {siteConfig} from '@/strings'
import {UserNav} from './user-nav'
import {useLocation} from 'react-router-dom'

export function SiteHeader() {
  const location = useLocation()
  const pathname = location.pathname
  return (
    <header className='sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container flex h-14 max-w-screen-2xl items-center'>
        <div className='mr-4 flex'>
          <Link
            href='/'
            className='mr-6 flex items-center space-x-2'
          >
            {/* <Icons.logo className='h-6 w-6' /> */}
            <span className='inline-block font-bold'>{siteConfig.name}</span>
          </Link>
          <nav className='flex items-center gap-4 text-sm lg:gap-6'>
            {/* <Link
              href='/docs'
              className={cn(
                'transition-colors hover:text-foreground/80',
                pathname === '/docs' ? 'text-foreground' : 'text-foreground/60'
              )}
            >
              Docs
            </Link> */}
          </nav>
        </div>
        <div className='flex flex-1 items-center justify-end space-x-2'>
          <nav className='flex items-center'>
            <Link
              href={siteConfig.links.github}
              target='_blank'
              rel='noreferrer'
            >
              <div
                className={cn(
                  buttonVariants({
                    variant: 'ghost'
                  }),
                  'w-9 px-0'
                )}
              >
                <Icons.gitHub className='h-4 w-4' />
                <span className='sr-only'>GitHub</span>
              </div>
            </Link>
            <Link
              href={siteConfig.links.twitter}
              target='_blank'
              rel='noreferrer'
            >
              <div
                className={cn(
                  buttonVariants({
                    variant: 'ghost'
                  }),
                  'w-9 px-0'
                )}
              >
                <Icons.twitter className='h-3 w-3 fill-current' />
                <span className='sr-only'>Twitter</span>
              </div>
            </Link>
            <div className='ml-auto flex items-center px-2'>
              <UserNav />
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
