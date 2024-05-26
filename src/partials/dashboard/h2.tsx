import {title} from 'process'

export interface H2Props {
  title: string
}

export default function H2(props: H2Props) {
  return (
    <h2 className='font-heading mt-12 scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0'>
      {/* id={props.title} */}
      {/* <a
        className='subheading-anchor font-medium underline underline-offset-4'
        aria-label='Link to section'
        href={`#${props.title}`}
      >
        <span className='icon icon-link'></span>
      </a> */}
      {props.title}
    </h2>
  )
}
