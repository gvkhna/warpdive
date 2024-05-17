import type {HTMLProps} from 'react'

export interface LinkProps extends HTMLProps<HTMLAnchorElement> {
  to?: string
  href: string
}

export default function Link(props: LinkProps) {
  const {children, to, href, className: classNameProp, ...rest} = props

  let className = classNameProp
  let disableOnClick = (event: any) => {
    event?.preventDefault()
    return false
  }
  if (props.disabled) {
    className += ' opacity-60 cursor-not-allowed'
  }

  return (
    <a
      href={href || to}
      className={className}
      onClick={props.disabled ? disableOnClick : undefined}
      {...rest}
    >
      {children}
    </a>
  )
}
