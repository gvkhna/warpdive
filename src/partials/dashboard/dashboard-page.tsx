import {PropsWithChildren, useEffect, useState} from 'react'
import useSWR from 'swr'
import type {InferRequestType} from 'hono/client'
import api from '@/lib/api-client'
import {cn} from '@/lib/utils'
import {Button} from '@/components/ui/button'
import {NavItemWithChildren, SidebarNav} from '../app/sidebar-nav'
import {ScrollArea} from '@/components/ui/scroll-area'
import DashboardEmptyState from './dashboard-empty-state'
import {PlusIcon} from '@radix-ui/react-icons'
import {useNavigate} from 'react-router-dom'
import {ChevronRightIcon, ExternalLinkIcon} from '@radix-ui/react-icons'
import {Badge} from '@/components/ui/badge'
import {formatRelativeTimeFromUTC} from '@/lib/format-dates'
import Link from '@/components/link'
const statuses = {
  offline: 'text-gray-500 bg-gray-100/10',
  online: 'text-green-400 bg-green-400/10',
  error: 'text-rose-400 bg-rose-400/10'
}

export interface DashboardPageProps {}

export default function DashboardPage({children}: PropsWithChildren<DashboardPageProps>) {
  const navigate = useNavigate()
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

  if (error) return <div>failed to load</div>
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
            {/* <MainPage /> */}
            {data && data?.recentBuilds.length > 0 ? (
              <>
                <header className='flex items-center justify-between border-b border-white/5'>
                  <h1 className='text-lg font-semibold leading-7 text-foreground dark:text-white'>Deployments</h1>
                </header>
                <ul
                  role='list'
                  className='divide-y divide-white/5'
                >
                  {data.recentBuilds.map((deployment) => (
                    <li
                      key={deployment.pid}
                      className='relative flex items-center space-x-4 px-2 py-4'
                    >
                      <div className='min-w-0 flex-auto'>
                        <div className='flex items-center gap-x-3'>
                          {/* <div className={cn(statuses[deployment.status], 'flex-none rounded-full p-1')}>
                    <div className='h-2 w-2 rounded-full bg-current' />
                  </div> */}
                          <h2 className='min-w-0 text-sm font-semibold leading-6  text-zinc-900 dark:text-white'>
                            <Link
                              href={`/app/deployment/${deployment.pid}`}
                              className='group flex h-auto gap-x-2 p-0 hover:no-underline'
                            >
                              <span className='truncate group-hover:underline'>{deployment.projectName}</span>
                              {deployment.tag ? (
                                deployment.tag.split(':').map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant={'outline'}
                                  >
                                    {deployment.tag}
                                  </Badge>
                                ))
                              ) : (
                                <>
                                  <span className='text-gray-400'>/</span>
                                  <span className='whitespace-nowrap group-hover:underline'>{deployment.pid}</span>
                                </>
                              )}

                              <span className='absolute inset-0' />
                            </Link>
                          </h2>
                        </div>
                        <div className='mt-3 flex items-center gap-x-2.5 text-xs leading-5 text-gray-400'>
                          <p className='truncate'>
                            {deployment.builtWith} - {deployment.builtBy}
                          </p>
                          <svg
                            viewBox='0 0 2 2'
                            className='h-0.5 w-0.5 flex-none fill-gray-300'
                          >
                            <circle
                              cx={1}
                              cy={1}
                              r={1}
                            />
                          </svg>
                          {deployment.createdAt && (
                            <p className='whitespace-nowrap'>{formatRelativeTimeFromUTC(deployment.createdAt)}</p>
                          )}
                        </div>
                      </div>
                      {/* <div
                className={cn(
                  environments[deployment.environment],
                  'ring-1 ring-inset flex-none rounded-full px-2 py-1 text-xs font-medium'
                )}
              >
                {deployment.environment}
              </div> */}
                      <ChevronRightIcon
                        className='h-5 w-5 flex-none text-gray-400'
                        aria-hidden='true'
                      />
                    </li>
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
