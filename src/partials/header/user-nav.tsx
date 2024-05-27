import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
import {Button} from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {formatUserProfileCookie} from '@/lib/format-user-profile-cookie'

import {useNavigate} from 'react-router-dom'

export function UserNav() {
  const navigate = useNavigate()

  const {fullName, githubLogin, githubAvatarUrl, initials, pid} = formatUserProfileCookie(document && document.cookie)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='relative h-8 w-8 rounded-full'
        >
          <Avatar className='h-8 w-8'>
            {githubAvatarUrl && (
              <AvatarImage
                src={githubAvatarUrl}
                alt={`@${githubLogin}`}
              />
            )}

            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className='w-56'
        align='end'
        forceMount
      >
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm font-medium leading-none'>{`@${githubLogin}`}</p>
            {/* <p className='text-xs leading-none text-muted-foreground'>m@example.com</p> */}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {/* <DropdownMenuItem
            onClick={() => {
              navigate('/app/settings/api-keys')
            }}
          >
            API Keys
          </DropdownMenuItem> */}
          <DropdownMenuItem
            onClick={() => {
              navigate('/app/settings')
            }}
          >
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {/* <DropdownMenuSeparator /> */}
        {/* <DropdownMenuItem onClick={() => setTheme('light')}>Light</DropdownMenuItem> */}
        {/* <DropdownMenuItem onClick={() => setTheme('dark')}>Dark</DropdownMenuItem> */}
        {/* <DropdownMenuItem onClick={() => setTheme('system')}>System</DropdownMenuItem> */}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            if (window && window.location) {
              window.location.href = '/signout'
            }
          }}
        >
          Signout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
