import {PropsWithChildren, useEffect, useState} from 'react'
import useSWR from 'swr'
import type {InferRequestType} from 'hono/client'
import api from '@/lib/api-client'
import {Button} from '@/components/ui/button'
import {NavItemWithChildren, SidebarNav} from '../app/sidebar-nav'
import {ScrollArea} from '@/components/ui/scroll-area'
import {DashboardEmptyState} from './dashboard-empty-state'
import {PlusIcon} from '@radix-ui/react-icons'
import {Link} from '@/components/link'
import {BuildRow} from '../builds/build-row'

export interface DashboardPageProps {}

export function DashboardPage(props: DashboardPageProps) {
  const [navItems, setNavItems] = useState<NavItemWithChildren[]>([])

  const call = api.dashboard
  const $get = call.$get
  const key = call.$url().pathname
  const fetcher = async (arg: InferRequestType<typeof $get>) => {
    const res = await $get(arg)
    if (res.ok) {
      const json = await res.json()
      return json
    } else {
      const json = await res.json()
      if ('message' in json && json.message) {
        throw new Error(json.message)
      } else {
        throw new Error('An unknown error occurred while fetching the data.')
      }
    }
  }
  const {data, error, isLoading} = useSWR(key, fetcher)

  useEffect(() => {
    if (data && data.projects) {
      const transformedItems = data.projects.map((item) => ({
        title: item.name,
        href: `/app/project/${item.pid}`,
        items: []
      }))
      setNavItems(transformedItems)
    }
  }, [data])

  console.log('data: ', data)

  if (error) return <div>failed to load {error.toString()}</div>
  if (isLoading) return <div></div>
  return (
    <div className='border-b'>
      <div className='container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10'>
        <aside className='fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block'>
          <ScrollArea className='h-full py-6 pr-6 lg:py-8'>
            <SidebarNav
              emptyText='No projects yet'
              items={[
                {
                  title: 'Projects',
                  button: (
                    <Button
                      size={'sm'}
                      className='h-8 gap-x-1 hover:no-underline'
                      asChild
                    >
                      <Link href='/app/projects/new'>
                        <PlusIcon className='h-3 w-3' />
                        {'New'}
                      </Link>
                    </Button>
                  ),
                  items: navItems
                }
              ]}
            />
          </ScrollArea>
        </aside>
        <main className='relative py-6 lg:gap-10 lg:py-8 xl:grid xl:grid-cols-[1fr_300px]'>
          <div className='mx-auto w-full min-w-0'>
            {data && data?.recentBuilds.length > 0 ? (
              <>
                <header className='flex items-center justify-between border-b border-white/5'>
                  <h1 className='text-lg font-semibold leading-7 text-foreground dark:text-white'>Deployments</h1>
                </header>
                <ul
                  role='list'
                  className='divide-y divide-white/5'
                >
                  {data.recentBuilds.map((build) => (
                    <BuildRow
                      key={build.pid}
                      pid={build.pid}
                      tag={build.tag}
                      createdAt={build.createdAt}
                      builtBy={build.builtBy}
                      builtWith={build.builtWith}
                      projectName={build.projectName}
                    />
                  ))}
                </ul>
              </>
            ) : (
              <DashboardEmptyState />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
