import {title} from 'process'

export interface H3Props {
  title: string
}

export default function H3(props: H3Props) {
  return (
    <h3 className='font-heading mt-8 scroll-m-20 text-xl font-semibold tracking-tight'>
      {/* id={props.title} */}
      {/* <a
        className='subheading-anchor font-medium underline underline-offset-4'
        aria-label='Link to section'
        href={`#${props.title}`}
      >
        <span className='icon icon-link'></span>
      </a> */}
      {props.title}
    </h3>
  )
}
