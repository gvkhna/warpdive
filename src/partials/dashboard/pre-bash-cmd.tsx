import {CopyButton} from './pre-bash-cmd-copy'

export interface PreBashCmdProps {
  cmd: string
  args: string[]
}

export function PreBashCmd(props: PreBashCmdProps) {
  return (
    <div className='relative'>
      <pre
        className='mb-4 mt-6 max-h-[650px] overflow-x-auto rounded-lg border bg-zinc-950 py-4 dark:bg-zinc-900'
        data-language='bash'
        data-theme='default'
      >
        <code
          className='relative grid min-w-full break-words bg-transparent font-mono text-sm'
          data-language='bash'
          data-theme='default'
        >
          <span className='inline-block min-h-4 w-full px-4 py-[0.125rem]'>
            <span className='font-bold text-white'>{props.cmd}</span>
            {props.args.map((arg, index) => (
              <span
                key={`pre-bash-cmd-${index}`}
                style={{
                  color: 'rgba(255, 255, 255, 0.95)'
                }}
              >
                {' '}
                {arg}
              </span>
            ))}
          </span>
        </code>
      </pre>
      <CopyButton
        value={`${props.cmd} ${props.args.join(' ')}`}
        className='absolute right-4 top-4'
      />
    </div>
  )
}
