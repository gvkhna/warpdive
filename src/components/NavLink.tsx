import type {HTMLProps} from 'react'
import {useLocation} from './AppCookieContext'
import log from '@log'

export interface NavLinkProps extends Omit<HTMLProps<HTMLAnchorElement>, 'className'> {
  to: string
  end?: boolean
  className?: string | ((props: {isActive: boolean; isPending: boolean}) => string | undefined)
}

export default function NavLink(props: NavLinkProps) {
  const {children, to, end, href, className: classNameProp = '', ...rest} = props

  const location = useLocation()
  let locationPathname = (location && location.pathname) || '/'
  let toPathname = to || href || '/'

  const isPending = false

  let isActive =
    locationPathname === toPathname ||
    (!end && locationPathname.startsWith(toPathname) && locationPathname.charAt(toPathname.length) === '/')

  // log('loc: ', location, toPathname, isActive)

  let className: string | undefined
  if (typeof classNameProp === 'function') {
    className = classNameProp({isActive, isPending})
  } else {
    // If the className prop is not a function, we use a default `active`
    // class for <NavLink />s that are active. In v5 `active` was the default
    // value for `activeClassName`, but we are removing that API and can still
    // use the old default behavior for a cleaner upgrade path and keep the
    // simple styling rules working as they currently do.
    className = [classNameProp, isActive ? 'active' : null, isPending ? 'pending' : null].filter(Boolean).join(' ')
  }
  let disableOnClick = (event: any) => {
    event?.preventDefault()
    return false
  }
  if (props.disabled) {
    className += ' opacity-60 cursor-not-allowed'
  }

  return (
    <a
      href={to || href}
      className={className}
      onClick={props.disabled ? disableOnClick : undefined}
      {...rest}
    >
      {children}
    </a>
  )
}
