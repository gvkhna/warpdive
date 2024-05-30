import {ChevronRightIcon, ExternalLinkIcon} from '@radix-ui/react-icons'
import {Badge} from '@/components/ui/badge'
import {formatRelativeTimeFromUTC} from '@/lib/format-dates'
import {Link} from '@/components/link'

import {cn} from '@/lib/utils'

const statuses = {
  offline: 'text-gray-500 bg-gray-100/10',
  online: 'text-green-400 bg-green-400/10',
  error: 'text-rose-400 bg-rose-400/10'
}

export interface BuildRowProps {
  pid: string | null
  projectName: string
  tag: string | null | undefined
  builtWith: string | null
  builtBy: string | null
  createdAt: string | null
}

export function BuildRow(props: BuildRowProps) {
  return (
    <li className='relative flex items-center space-x-4 px-2 py-4'>
      <div className='min-w-0 flex-auto'>
        <div className='flex items-center gap-x-3'>
          {/* <div className={cn(statuses[deployment.status], 'flex-none rounded-full p-1')}>
                    <div className='h-2 w-2 rounded-full bg-current' />
                  </div> */}
          <h2 className='min-w-0 text-sm font-semibold leading-6  text-zinc-900 dark:text-white'>
            <Link
              href={`/app/deployment/${props.pid}`}
              className='group flex h-auto gap-x-2 p-0 hover:no-underline'
            >
              <span className='truncate group-hover:underline'>{props.projectName}</span>
              {props.tag ? (
                props.tag.split(':').map((tag) => (
                  <Badge
                    key={tag}
                    variant={'outline'}
                  >
                    {tag}
                  </Badge>
                ))
              ) : (
                <>
                  <span className='text-gray-400'>/</span>
                  <span className='whitespace-nowrap group-hover:underline'>{props.pid}</span>
                </>
              )}

              <span className='absolute inset-0' />
            </Link>
          </h2>
        </div>
        <div className='text-gray-400 mt-3 flex  items-center text-xs leading-5'>
          {/* gap-x-2.5 */}
          <p className='truncate'>
            {props.builtBy && props.builtWith && (
              <>
                {props.builtWith} - {props.builtBy}
              </>
            )}
          </p>
          {/* <svg
            viewBox='0 0 2 2'
            className='h-0.5 w-0.5 flex-none fill-gray-300'
          >
            <circle
              cx={1}
              cy={1}
              r={1}
            />
          </svg> */}
          {props.createdAt && <p className='whitespace-nowrap'>{formatRelativeTimeFromUTC(props.createdAt)}</p>}
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
        className='text-gray-400 h-5 w-5 flex-none'
        aria-hidden='true'
      />
    </li>
  )
}
