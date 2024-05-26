import Link from '@/components/link'

import {ChevronRightIcon, ExternalLinkIcon} from '@radix-ui/react-icons'
import {cn} from '@/lib/utils'

const statuses = {
  offline: 'text-gray-500 bg-gray-100/10',
  online: 'text-green-400 bg-green-400/10',
  error: 'text-rose-400 bg-rose-400/10'
}

const deployments = [
  {
    id: 1,
    href: '#',
    projectName: 'ios-app',
    teamName: 'Planetaria',
    status: 'offline',
    statusText: 'Initiated 1m 32s ago',
    description: 'Deploys from GitHub',
    environment: 'Preview'
  },
  {
    id: 1,
    href: '#',
    projectName: 'ios-app',
    teamName: 'Planetaria',
    status: 'offline',
    statusText: 'Initiated 1m 32s ago',
    description: 'Deploys from GitHub',
    environment: 'Preview'
  },
  {
    id: 1,
    href: '#',
    projectName: 'ios-app',
    teamName: 'Planetaria',
    status: 'offline',
    statusText: 'Initiated 1m 32s ago',
    description: 'Deploys from GitHub',
    environment: 'Preview'
  }
  // More deployments...
]

const environments = {
  Preview: 'text-gray-400 bg-gray-400/10 ring-gray-400/20',
  Production: 'text-indigo-400 bg-indigo-400/10 ring-indigo-400/30'
}

export default function MainPage() {
  return (
    <main className='relative py-6 lg:gap-10 lg:py-8 xl:grid xl:grid-cols-[1fr_300px]'>
      <div className='mx-auto w-full min-w-0'>
        {/* <div className='mb-4 flex items-center space-x-1 text-sm text-muted-foreground'>
          <div className='overflow-hidden text-ellipsis whitespace-nowrap'>Dashboard</div>
          <ChevronRightIcon className='h-4 w-4' />
          <div className='font-medium text-foreground'>Projects</div>
        </div> */}

        <header className='flex items-center justify-between border-b border-white/5'>
          <h1 className='text-lg font-semibold leading-7 text-foreground dark:text-white'>Deployments</h1>
        </header>
        <ul
          role='list'
          className='divide-y divide-white/5'
        >
          {deployments.map((deployment) => (
            <li
              key={deployment.id}
              className='relative flex items-center space-x-4 px-2 py-4'
            >
              <div className='min-w-0 flex-auto'>
                <div className='flex items-center gap-x-3'>
                  <div className={cn(statuses[deployment.status], 'flex-none rounded-full p-1')}>
                    <div className='h-2 w-2 rounded-full bg-current' />
                  </div>
                  <h2 className='min-w-0 text-sm font-semibold leading-6  text-zinc-900 dark:text-white'>
                    <a
                      href={deployment.href}
                      className='flex gap-x-2'
                    >
                      <span className='truncate'>{deployment.teamName}</span>
                      <span className='text-gray-400'>/</span>
                      <span className='whitespace-nowrap'>{deployment.projectName}</span>
                      <span className='absolute inset-0' />
                    </a>
                  </h2>
                </div>
                <div className='mt-3 flex items-center gap-x-2.5 text-xs leading-5 text-gray-400'>
                  <p className='truncate'>{deployment.description}</p>
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
                  <p className='whitespace-nowrap'>{deployment.statusText}</p>
                </div>
              </div>
              <div
                className={cn(
                  environments[deployment.environment],
                  'ring-1 ring-inset flex-none rounded-full px-2 py-1 text-xs font-medium'
                )}
              >
                {deployment.environment}
              </div>
              <ChevronRightIcon
                className='h-5 w-5 flex-none text-gray-400'
                aria-hidden='true'
              />
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
