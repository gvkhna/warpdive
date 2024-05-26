import {Children, PropsWithChildren} from 'react'
import {SiteHeader} from '../header/app-header'
import {SiteFooter} from '../footer/site-footer'
export interface AppLayoutProps {}

export default function AppLayout({children}: PropsWithChildren<AppLayoutProps>) {
  return (
    <div className='relative flex min-h-screen flex-col bg-background'>
      <SiteHeader />
      <main className='flex-1'>{children}</main>
      <SiteFooter />
    </div>
  )
}
