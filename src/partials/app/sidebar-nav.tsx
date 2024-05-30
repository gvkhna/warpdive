import {cn} from '@/lib/utils'
import {Icons} from '../header/icons'
import {useLocation} from 'react-router-dom'
import {Link} from '@/components/link'

export interface NavItem {
  title: string
  button?: JSX.Element
  href?: string
  disabled?: boolean
  external?: boolean
  icon?: keyof typeof Icons
  label?: string
}

export interface NavItemWithChildren extends NavItem {
  items: NavItemWithChildren[]
}

export interface MainNavItem extends NavItem {}

export interface SidebarNavItem extends NavItemWithChildren {}

export interface SidebarNavProps {
  emptyText?: string
  items: SidebarNavItem[]
}

export function SidebarNav({items, emptyText}: SidebarNavProps) {
  const location = useLocation()
  const pathname = location.pathname

  return items.length ? (
    <div className='w-full'>
      {items.map((item, index) => (
        <div
          key={index}
          className={cn('pb-4')}
        >
          <h4 className='mb-1 flex items-center justify-between rounded-md px-2 py-1 text-sm font-semibold'>
            {item.title}
            {item.button && item.button}
          </h4>
          {item?.items?.length > 0 ? (
            <SidebarNavItems
              items={item.items}
              pathname={pathname}
            />
          ) : (
            <>
              {emptyText && (
                <span className='px-1.5 py-0.5 text-xs leading-none text-muted-foreground no-underline opacity-70 group-hover:no-underline'>
                  {emptyText}
                </span>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  ) : null
}

interface SidebarNavItemsProps {
  items: SidebarNavItem[]
  pathname: string | null
}

export function SidebarNavItems({items, pathname}: SidebarNavItemsProps) {
  return items?.length ? (
    <div className='grid grid-flow-row auto-rows-max text-sm'>
      {items.map((item, index) =>
        item.href && !item.disabled ? (
          <Link
            key={index}
            href={item.href}
            className={cn(
              'group flex h-auto w-full items-center rounded-md border border-transparent px-2 py-1 hover:underline',
              item.disabled && 'cursor-not-allowed opacity-60',
              pathname === item.href ? 'font-medium text-foreground' : 'text-muted-foreground'
            )}
            target={item.external ? '_blank' : ''}
            rel={item.external ? 'noreferrer' : ''}
          >
            {item.title}
            {item.label && (
              <span className='ml-2 rounded-md bg-[#adfa1d] px-1.5 py-0.5 text-xs leading-none text-[#000000] no-underline group-hover:no-underline'>
                {item.label}
              </span>
            )}
          </Link>
        ) : (
          <span
            key={index}
            className={cn(
              'flex w-full cursor-not-allowed items-center rounded-md p-2 text-muted-foreground hover:underline',
              item.disabled && 'cursor-not-allowed opacity-60'
            )}
          >
            {item.title}
            {item.label && (
              <span className='ml-2 rounded-md bg-muted px-1.5 py-0.5 text-xs leading-none text-muted-foreground no-underline group-hover:no-underline'>
                {item.label}
              </span>
            )}
          </span>
        )
      )}
    </div>
  ) : null
}
