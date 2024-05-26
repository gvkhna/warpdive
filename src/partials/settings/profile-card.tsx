import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {formatUserProfileCookie} from '@/lib/format-user-profile-cookie'

export default function ProfileCard() {
  const {fullName, githubLogin, githubAvatarUrl, initials, pid} = formatUserProfileCookie(document && document.cookie)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Github Account</CardTitle>
      </CardHeader>
      <CardContent className='grid gap-8'>
        <div className='flex items-center gap-4'>
          <Avatar className='hidden h-9 w-9 sm:flex'>
            {githubAvatarUrl && (
              <AvatarImage
                src={githubAvatarUrl}
                alt={`@${githubLogin}`}
              />
            )}

            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className='grid gap-1'>
            <p className='text-sm font-medium leading-none'>{fullName}</p>
            <p className='text-sm text-muted-foreground'>{`@${githubLogin}`}</p>
          </div>
          {/* <div className='ml-auto font-mono text-sm'>{`uid_${pid}`}</div> */}
        </div>
      </CardContent>
    </Card>
  )
}
