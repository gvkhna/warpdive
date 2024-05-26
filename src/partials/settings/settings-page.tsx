import {Separator} from '@/components/ui/separator'
import {SettingsSidebarNav} from './settings-sidebar-nav'
import ProfileCard from './profile-card'
import {Button, buttonVariants} from '@/components/ui/button'
import ApiKeys from './api-keys-card'
import DeleteUserForm from './delete-user-form'

import api from '@/lib/api-client'
import {useState} from 'react'
import {DeleteUserFormProps} from './delete-user-form'

const sidebarNavItems = [
  {
    title: 'Settings',
    href: '/app/settings'
  }
]

export interface SettingsPageProps extends DeleteUserFormProps {}

export default function SettingsPage(props: SettingsPageProps) {
  return (
    <>
      <div className='hidden space-y-6 p-10 pb-16 md:block'>
        <div className='space-y-0.5'>
          <h2 className='text-2xl font-bold tracking-tight'>Settings</h2>
          <p className='text-muted-foreground'>Manage your account settings.</p>
        </div>
        <Separator className='my-6' />
        <div className='flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0'>
          <aside className='-mx-4 lg:w-1/5'>
            <SettingsSidebarNav items={sidebarNavItems} />
          </aside>
          <div className='flex-1 lg:max-w-2xl'>
            <div className='space-y-6'>
              <ProfileCard />
              <ApiKeys />
              <DeleteUserForm showInitialError={props.showInitialError} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
