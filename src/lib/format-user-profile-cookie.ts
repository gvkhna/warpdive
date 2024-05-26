import {getInitials} from '@/lib/format-names'
import {cookieParse} from '@/lib/cookie-parse'
import {USER_PROFILE_COOKIE_NAME} from '@/lib/cookies'

export function formatUserProfileCookie(cookie: string | null) {
  let fullName = ''
  let githubLogin = ''
  let githubAvatarUrl: string | undefined = undefined
  let initials = ''
  let pid = ''
  if (cookie) {
    const cookies = cookieParse(document.cookie)
    const userProfileVal = cookies.get(USER_PROFILE_COOKIE_NAME)
    if (userProfileVal) {
      try {
        const userProfile: unknown = JSON.parse(userProfileVal)
        if (userProfile && typeof userProfile === 'object') {
          if ('fullName' in userProfile && typeof userProfile.fullName === 'string') {
            fullName = userProfile.fullName
          }
          if ('githubAvatarUrl' in userProfile && typeof userProfile.githubAvatarUrl === 'string') {
            githubAvatarUrl = userProfile.githubAvatarUrl
          }
          if ('githubLogin' in userProfile && typeof userProfile.githubLogin === 'string') {
            githubLogin = userProfile.githubLogin
          }
          if ('pid' in userProfile && typeof userProfile.pid === 'string') {
            pid = userProfile.pid
          }
        }
      } catch (e) {
        // ignore error
      }
      if (fullName) {
        initials = getInitials(fullName)
      }
    }
  }
  return {fullName, githubLogin, githubAvatarUrl, initials, pid}
}
