import {Separator} from '@/components/ui/separator'
import {SettingsSidebarNav} from './settings-sidebar-nav'
import {ProfileCard} from './profile-card'
import {Button, buttonVariants} from '@/components/ui/button'
import {ApiKeysCard} from './api-keys-card'
import {DeleteUserForm} from './delete-user-form'
import useSWR from 'swr'
import type {InferRequestType} from 'hono/client'
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

export function SettingsPage(props: SettingsPageProps) {
  const call = api.users.settings
  const $get = call.$get
  const key = call.$url().pathname
  const fetcher = async (arg: InferRequestType<typeof $get>) => {
    const res = await $get(arg)
    if (res.ok) {
      const json = await res.json()
      return json
    } else {
      const json = await res.json()
      if ('message' in json && json.message) {
        throw new Error(json.message)
      } else {
        throw new Error('An unknown error occurred while fetching the data.')
      }
    }
  }
  const {data, error, isLoading} = useSWR(key, fetcher)

  return (
    <div className='container'>
      <div className='block space-y-6 p-10 pb-16'>
        <div className='space-y-0.5'>
          <h2 className='text-2xl font-bold tracking-tight'>Settings</h2>
          <p className='text-muted-foreground'>Manage your account settings.</p>
        </div>
        <Separator className='my-6' />
        <div className='flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0'>
          <aside className='-mx-4 hidden lg:block lg:w-1/5'>
            <SettingsSidebarNav items={sidebarNavItems} />
          </aside>
          <div className='flex-1 lg:max-w-2xl'>
            <div className='space-y-6'>
              <ProfileCard />
              <ApiKeysCard apiKeys={data?.apiKeys} />
              {/* <DeleteUserForm showInitialError={props.showInitialError} /> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
