import {addDays, addHours, addMinutes} from 'date-fns'
import type {AstroGlobal} from 'astro'

const {PUBLIC_WEB_HOSTNAME} = import.meta.env

const secure = PUBLIC_WEB_HOSTNAME ? new URL(PUBLIC_WEB_HOSTNAME).protocol === 'https:' : false

const FLASH_COOKIE_NAME = '_flash'
const OAUTH_STATE_COOKIE_NAME = '_oauth_state'
const USER_AUTH_COOKIE_NAME = '_user_auth'
const USER_PROFILE_COOKIE_NAME = '_user_profile'

export function deleteAllCookies(astro: AstroGlobal) {
  deleteFlashCookie(astro)
  deleteOauthStateCookie(astro)
  deleteUserAuthCookie(astro)
  deleteUserProfileCookie(astro)
}

export interface UserProfile {
  githubAvatarUrl?: string | null
  githubLogin?: string | null
  fullName?: string | null
}

export function setUserProfileCookie(state: UserProfile, astro: AstroGlobal) {
  let maxAge = 60 * 60 * 24 * 30 // 30 days in seconds
  let expires = addDays(new Date(), 30)
  astro.cookies.set(USER_PROFILE_COOKIE_NAME, JSON.stringify(state), {
    httpOnly: false,
    secure: secure,
    sameSite: true,
    maxAge,
    expires,
    path: '/'
  })
}

export function deleteUserProfileCookie(astro: AstroGlobal) {
  astro.cookies.delete(USER_PROFILE_COOKIE_NAME, {
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

export function setFlashCookie(state: string, astro: AstroGlobal) {
  let maxAge = 60 * 5 // 5 minutes in seconds
  let expires = addMinutes(new Date(), 5)
  astro.cookies.set(FLASH_COOKIE_NAME, state, {
    httpOnly: false,
    secure: secure,
    sameSite: true,
    maxAge,
    expires,
    path: '/'
  })
}

export function deleteFlashCookie(astro: AstroGlobal) {
  astro.cookies.delete(FLASH_COOKIE_NAME, {
    path: '/'
  })
}

export function getFlashCookie(astro: AstroGlobal) {
  const str = astro.cookies.get(FLASH_COOKIE_NAME)?.value
  if (typeof str === 'string') {
    return str
  }
  return undefined
}

export function setUserAuthCookie(state: string, astro: AstroGlobal) {
  let maxAge = 60 * 60 * 24 * 30 // 30 days in seconds
  let expires = addDays(new Date(), 30)
  astro.cookies.set(USER_AUTH_COOKIE_NAME, state, {
    httpOnly: false,
    secure: secure,
    sameSite: true,
    maxAge,
    expires,
    path: '/'
  })
}

export function deleteUserAuthCookie(astro: AstroGlobal) {
  astro.cookies.delete(USER_AUTH_COOKIE_NAME, {
    path: '/'
  })
}

export function getUserAuthCookie(astro: AstroGlobal) {
  const str = astro.cookies.get(USER_AUTH_COOKIE_NAME)?.value
  if (typeof str === 'string') {
    return str
  }
  return undefined
}

export function setOauthStateCookie(state: string, astro: AstroGlobal) {
  let maxAge = 60 * 60 * 1 // 1 hour in seconds
  let expires = addHours(new Date(), 1)
  astro.cookies.set(OAUTH_STATE_COOKIE_NAME, state, {
    httpOnly: false,
    secure: secure,
    sameSite: true,
    maxAge,
    expires,
    path: '/'
  })
}

export function deleteOauthStateCookie(astro: AstroGlobal) {
  astro.cookies.delete(OAUTH_STATE_COOKIE_NAME, {
    path: '/'
  })
}

export function getOauthStateCookie(astro: AstroGlobal) {
  const str = astro.cookies.get(OAUTH_STATE_COOKIE_NAME)?.value
  if (typeof str === 'string') {
    return str
  }
  return undefined
}
