import {Children, PropsWithChildren} from 'react'
import {AppHeader} from '../header/app-header'
import {AppFooter} from '../footer/app-footer'
import {useLocation} from 'react-router-dom'
export interface AppLayoutProps {}

export default function AppLayout({children}: PropsWithChildren<AppLayoutProps>) {
  const location = useLocation()

  const hideFooter = location.pathname.startsWith('/app/deployment')
  return (
    <div className='relative flex min-h-screen flex-col bg-background'>
      <AppHeader />
      <main className='flex-1'>{children}</main>
      {!hideFooter && <AppFooter />}
    </div>
  )
}
