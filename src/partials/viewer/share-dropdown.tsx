import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import type {InferRequestType} from 'hono/client'
import {Switch} from '@/components/ui/switch'
import {Label} from '@/components/ui/label'
import {Input} from '@/components/ui/input'
import {useEffect, useState} from 'react'
import {Button, type ButtonProps} from '@/components/ui/button'
import {cn} from '@/lib/utils'

import {ToggleGroup, ToggleGroupItem} from '@/components/ui/toggle-group'
import {Clipboard, Diff, Globe, Layers, Lock, Share, CheckIcon, ClipboardIcon} from 'lucide-react'
import api from '@/lib/api-client'
import useSWR, {mutate} from 'swr'
const {PUBLIC_WEB_HOSTNAME} = import.meta.env

interface CopyButtonProps extends ButtonProps {
  value: string
  src?: string
}

export async function copyToClipboardWithMeta(value: string) {
  navigator.clipboard.writeText(value)
}

export function CopyButton({value, className, src, variant = 'ghost', ...props}: CopyButtonProps) {
  const [hasCopied, setHasCopied] = useState(false)
  useEffect(() => {
    setTimeout(() => {
      setHasCopied(false)
    }, 2000)
  }, [hasCopied])

  return (
    <Button
      className={cn('w-full text-zinc-50 hover:bg-zinc-700 hover:text-zinc-50', className)}
      onClick={() => {
        copyToClipboardWithMeta(value)
        setHasCopied(true)
      }}
      {...props}
    >
      {hasCopied ? <CheckIcon className='h-3 w-3' /> : <ClipboardIcon className='h-3 w-3' />}
      <span className='ml-2'>Copy link</span>
    </Button>
  )
}

interface ShareDropdownLinkFormProps {
  pid: string
}

export function ShareDropdownLinkForm({pid}: ShareDropdownLinkFormProps) {
  const call = api.builds[':pid']
  const $get = call.$get
  const key = call.$url().pathname
  const fetcher = (arg: InferRequestType<typeof $get>) => async () => {
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
  const {data, error, isLoading} = useSWR(
    key,
    fetcher({
      param: {
        pid
      }
    })
  )

  console.log('dropdown contents data: ', data)

  if (error) {
    return <div>failed to load</div>
  }
  if (isLoading) {
    return <div>loading...</div>
  }

  const shareLink = `${PUBLIC_WEB_HOSTNAME}/share/${pid}/`
  const shared = data?.build.public || false
  return (
    <DropdownMenuGroup>
      {/* <p>test content</p> */}
      <div className='mx-2 mb-1 mt-2 flex flex-col gap-y-4'>
        <div className='flex items-center space-x-2'>
          <Switch
            id='shared-link'
            checked={shared}
            onCheckedChange={(val) => {
              // setShared(val)
              if (shared) {
                api.builds[':pid']['set-private']
                  .$get({
                    param: {
                      pid
                    }
                  })
                  .then(() => {
                    mutate(api.builds[':pid'].$url().pathname)
                  })
                  .catch((e) => {
                    console.log('e', e)
                  })
              } else {
                api.builds[':pid']['set-public']
                  .$get({
                    param: {
                      pid
                    }
                  })
                  .then(() => {
                    mutate(api.builds[':pid'].$url().pathname)
                  })
                  .catch((e) => {
                    console.log('e', e)
                  })
              }
            }}
          />
          <Label htmlFor='shared-link'>Create shared link</Label>
        </div>
        {shared && (
          <>
            <div>
              <Input
                className='text-xs'
                value={shareLink}
                readOnly={true}
              />
            </div>

            <div>
              <CopyButton value={shareLink} />
            </div>
          </>
        )}
        <div className='flex items-center'>
          {shared ? (
            <>
              <Globe className='mr-2 h-3 w-3 text-muted-foreground' />
              <span className='text-xs text-muted-foreground'>This warpdive is shared publicly</span>
            </>
          ) : (
            <>
              <Lock className='mr-2 h-3 w-3 text-muted-foreground' />
              <span className='text-xs text-muted-foreground'>This warpdive is private</span>
            </>
          )}
        </div>
      </div>
    </DropdownMenuGroup>
  )
}

export interface ShareDropdownProps {
  pid: string
}

export function ShareDropdown(props: ShareDropdownProps) {
  const [shared, setShared] = useState(false)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          size={'sm'}
        >
          <Share className='mr-1 h-3 w-3' />
          <span>Share</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56'>
        <DropdownMenuLabel>Share Link</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ShareDropdownLinkForm pid={props.pid} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
