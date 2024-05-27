import {Children, PropsWithChildren} from 'react'
import {SiteHeader} from '../header/app-header'
import {SiteFooter} from '../footer/site-footer'
import {useLocation} from 'react-router-dom'
export interface AppLayoutProps {}

export default function AppLayout({children}: PropsWithChildren<AppLayoutProps>) {
  const location = useLocation()

  const hideFooter = location.pathname.startsWith('/app/deployment')
  return (
    <div className='relative flex min-h-screen flex-col bg-background'>
      <SiteHeader />
      <main className='flex-1'>{children}</main>
      {!hideFooter && <SiteFooter />}
    </div>
  )
}
