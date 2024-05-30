import {PropsWithChildren} from 'react'

export interface ParagraphProps {}

export function Paragraph(props: PropsWithChildren<ParagraphProps>) {
  return <p className={`leading-7 [&:not(:first-child)]:mt-6`}>{props.children}</p>
}
