import {addDays, addHours, addMinutes} from 'date-fns'
import type {AstroCookies, AstroGlobal} from 'astro'

const {PUBLIC_WEB_HOSTNAME} = import.meta.env

const secure = PUBLIC_WEB_HOSTNAME ? new URL(PUBLIC_WEB_HOSTNAME).protocol === 'https:' : false

const FLASH_COOKIE_NAME = '_flash'
const OAUTH_STATE_COOKIE_NAME = '_oauth_state'
export const USER_PROFILE_COOKIE_NAME = '_user_profile'
export const USER_AUTH_COOKIE_NAME = '_user_auth'

export function deleteAllCookies(astroCookies: Readonly<AstroCookies>) {
  deleteFlashCookie(astroCookies)
  deleteOauthStateCookie(astroCookies)
  deleteUserAuthCookie(astroCookies)
  deleteUserProfileCookie(astroCookies)
}

export interface UserProfile {
  githubAvatarUrl: string | null
  githubLogin: string | null
  fullName: string | null
  pid: string | null
}

export function setUserProfileCookie(state: UserProfile, astroCookies: Readonly<AstroCookies>) {
  let maxAge = 60 * 60 * 24 * 30 // 30 days in seconds
  let expires = addDays(new Date(), 30)
  astroCookies.set(USER_PROFILE_COOKIE_NAME, JSON.stringify(state), {
    httpOnly: false,
    secure: secure,
    sameSite: secure,
    maxAge,
    expires,
    path: '/'
  })
}

export function deleteUserProfileCookie(astroCookies: Readonly<AstroCookies>) {
  astroCookies.delete(USER_PROFILE_COOKIE_NAME, {
    path: '/'
  })
}

export function getUserProfileCookie(astro: AstroGlobal): UserProfile | undefined {
  const str = astro.cookies.get(USER_PROFILE_COOKIE_NAME)?.value
  if (typeof str === 'string' && str) {
    try {
      return JSON.parse(str) as UserProfile
    } catch (e) {
      // ignore parse error
    }
  }
  return undefined
}

export function setFlashCookie(state: string, astroCookies: Readonly<AstroCookies>) {
  let maxAge = 60 * 5 // 5 minutes in seconds
  let expires = addMinutes(new Date(), 5)
  astroCookies.set(FLASH_COOKIE_NAME, state, {
    httpOnly: true,
    secure: secure,
    sameSite: secure,
    maxAge,
    expires,
    path: '/'
  })
}

export function deleteFlashCookie(astroCookies: Readonly<AstroCookies>) {
  astroCookies.delete(FLASH_COOKIE_NAME, {
    path: '/'
  })
}

export function getFlashCookie(astroCookies: Readonly<AstroCookies>) {
  const str = astroCookies.get(FLASH_COOKIE_NAME)?.value
  if (typeof str === 'string') {
    return str
  }
  return undefined
}

export function setUserAuthCookie(state: string, astroCookies: Readonly<AstroCookies>) {
  let maxAge = 60 * 60 * 24 * 30 // 30 days in seconds
  let expires = addDays(new Date(), 30)
  astroCookies.set(USER_AUTH_COOKIE_NAME, state, {
    httpOnly: true,
    secure: secure,
    sameSite: secure,
    maxAge,
    expires,
    path: '/'
  })
}

export function deleteUserAuthCookie(astroCookies: Readonly<AstroCookies>) {
  astroCookies.delete(USER_AUTH_COOKIE_NAME, {
    path: '/'
  })
}

export function getUserAuthCookie(astroCookies: Readonly<AstroCookies>) {
  const str = astroCookies.get(USER_AUTH_COOKIE_NAME)?.value
  if (typeof str === 'string') {
    return str
  }
  return undefined
}

export function setOauthStateCookie(state: string, astroCookies: Readonly<AstroCookies>) {
  let maxAge = 60 * 60 * 1 // 1 hour in seconds
  let expires = addHours(new Date(), 1)
  astroCookies.set(OAUTH_STATE_COOKIE_NAME, state, {
    httpOnly: true,
    secure: secure,
    sameSite: secure,
    maxAge,
    expires,
    path: '/'
  })
}

export function deleteOauthStateCookie(astroCookies: Readonly<AstroCookies>) {
  astroCookies.delete(OAUTH_STATE_COOKIE_NAME, {
    path: '/'
  })
}

export function getOauthStateCookie(astroCookies: Readonly<AstroCookies>) {
  const str = astroCookies.get(OAUTH_STATE_COOKIE_NAME)?.value
  if (typeof str === 'string') {
    return str
  }
  return undefined
}
