import {cn} from '@/lib/utils'
import {CodeInline} from './code-inline'
import {H2} from './h2'
import {Paragraph} from './paragraph'
import {PreBashCmd} from './pre-bash-cmd'
import {Link} from '@/components/link'

import {PlusIcon} from 'lucide-react'
import {Button} from '@/components/ui/button'

export function DashboardEmptyState() {
  return (
    <>
      <div className='space-y-2'>
        <h1 className={cn('scroll-m-20 text-4xl font-bold tracking-tight')}>Getting started</h1>
        {/* <p className='text-lg text-muted-foreground'>How to start using the warpdive cli</p> */}
      </div>
      <div className='pb-8 pt-8'>
        <div className='mdx'>
          <Paragraph>
            <ol>
              <li>
                1. Create an API Key in{' '}
                <Link
                  href='/app/settings'
                  className='text-md px-0 underline'
                >
                  Settings
                </Link>
              </li>
              <li>2. Log into warpdive-cli</li>
            </ol>
          </Paragraph>
          <PreBashCmd
            cmd={'npx'}
            args={['warpdive', 'login']}
          />
          <div className='mdx'>
            <ol>
              <li className='flex items-center'>
                <span>3. Create a project</span>
                <div>
                  <Button
                    size={'sm'}
                    className='ml-2 flex h-7 gap-x-1 p-1.5 hover:no-underline'
                    asChild
                  >
                    <Link href='/app/projects/new'>
                      <PlusIcon className='h-2.5 w-2.5' />
                      {'New'}
                    </Link>
                  </Button>
                </div>
              </li>
            </ol>
          </div>
          <H2 title='Build/Push' />
          <Paragraph>
            Use the <CodeInline>npx warpdive</CodeInline> command to build or push a container image.
          </Paragraph>
          <PreBashCmd
            cmd={'npx'}
            args={['warpdive', 'build', '.', '--wd-project', 'my-project']}
          />
          <i>Note: Make sure to specify the project name to keep images grouped.</i>

          <PreBashCmd
            cmd={'npx'}
            args={['warpdive', 'push', 'alpine:latest', '--wd-project', 'my-alpine']}
          />
        </div>
      </div>
    </>
  )
}
