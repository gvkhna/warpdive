import {PropsWithChildren} from 'react'

export interface CodeInlineProps {}

export function CodeInline(props: PropsWithChildren<CodeInlineProps>) {
  return <code className='relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm'>{props.children}</code>
}
