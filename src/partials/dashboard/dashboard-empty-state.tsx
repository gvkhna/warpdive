import {cn} from '@/lib/utils'
import {CodeInline} from './code-inline'
import {H2} from './h2'
import {Paragraph} from './paragraph'
import {PreBashCmd} from './pre-bash-cmd'

export function DashboardEmptyState() {
  return (
    <>
      <div className='space-y-2'>
        <h1 className={cn('scroll-m-20 text-4xl font-bold tracking-tight')}>Getting started</h1>
        <p className='text-lg text-muted-foreground'>How to start using the warpdive cli</p>
      </div>
      <div className='pb-12 pt-8'>
        <div className='mdx'>
          {/* <H2 title='init' />
          <Paragraph>
            Use the <CodeInline>init</CodeInline> command to initialize configuration and dependencies for a new
            project.
          </Paragraph>
          <Paragraph>
            The <CodeInline>init</CodeInline> command installs dependencies, adds the <CodeInline>cn</CodeInline> util,
            configures , and CSS variables for the project.
          </Paragraph>

          <Paragraph>
            You will be asked a few questions to configure <CodeInline>components.json</CodeInline>:
          </Paragraph>

          <PreBashCmd
            cmd={'npx'}
            args={['test']}
          /> */}
        </div>
      </div>
    </>
  )
}
