import type {HTMLProps} from 'react'
import {Link as ReactRouterDomLink} from 'react-router-dom'
import {buttonVariants} from '@/components/ui/button'
import {cn} from '@/lib/utils'

export interface LinkProps extends HTMLProps<HTMLAnchorElement> {
  to?: string
  href: string
}

export default function Link(props: LinkProps) {
  const {children, to, href, className: classNameProp, ...rest} = props

  let linkHref = ''
  if (href) {
    linkHref = href
  }
  if (to) {
    linkHref = to
  }
  let className = classNameProp + ' justify-start'
  if (props.disabled) {
    className += ' opacity-60 cursor-not-allowed'
  }

  return (
    <ReactRouterDomLink
      to={linkHref}
      className={cn(buttonVariants({variant: 'link'}), className)}
      {...rest}
    >
      {children}
    </ReactRouterDomLink>
  )
}
