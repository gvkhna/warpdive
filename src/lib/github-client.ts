import {AstroCookies, AstroGlobal} from 'astro'
import {drizzle} from 'drizzle-orm/d1'
import {eq} from 'drizzle-orm'
import * as schema from '@/db/schema'
import {sign, verify} from 'hono/jwt'
const {crypto} = globalThis
import {addDays} from 'date-fns'
import {
  deleteAllCookies,
  getUserAuthCookie,
  setFlashCookie,
  setOauthStateCookie,
  setUserAuthCookie,
  setUserProfileCookie
} from './cookies'
import {GITHUB_OAUTH_REDIRECT_URL} from '@/strings'
import {getSecretAstro} from '@/secrets'
import {randomString} from './random-string'
const {PUBLIC_GITHUB_CLIENT_ID} = import.meta.env

interface UserSession {
  valid: boolean
  displayError: Error | undefined
  redirect: Response | undefined
}

function redirect(path: string) {
  return new Response(null, {
    status: 302,
    headers: {
      Location: path
    }
  })
}

export async function verifyValidSession(
  locals: App.Locals,
  astroCookies: Readonly<AstroCookies>
): Promise<UserSession> {
  let displayError: Error | undefined = undefined
  const userAuthCookie = getUserAuthCookie(astroCookies)

  if (userAuthCookie) {
    const db = drizzle(locals.runtime.env.DB, {schema})
    const result = await db.query.userSessions.findFirst({
      where: eq(schema.userSessions.sessionToken, userAuthCookie)
    })
    if (result) {
      try {
        // verify session token
        const appSecret = getSecretAstro('APP_SECRET_KEY', locals)
        const decodedPayload = await verify(userAuthCookie, appSecret, 'HS256')
        return {
          valid: true,
          displayError: undefined,
          redirect: redirect('/app/')
        }
      } catch (verifyError) {
        if (verifyError instanceof Error) {
          const errorName = verifyError.name
          switch (errorName) {
            case 'JwtAlgorithmNotImplemented':
              displayError = new Error(`JWT Token verification failed: algorithm not implemented`)
              break
            case 'JwtTokenInvalid':
              displayError = new Error(`JWT Token verification failed: token invalid`)
              break
            case 'JwtTokenNotBefore':
              displayError = new Error(`JWT Token verification failed: token used before valid`)
              break
            case 'JwtTokenExpired':
              return {
                valid: false,
                displayError: undefined,
                redirect: redirect('/session-expired')
              }
            case 'JwtTokenIssuedAt':
              displayError = new Error(`JWT Token verification failed: incorrect 'iat' claim`)
              break
            case 'JwtTokenSignatureMismatched':
              displayError = new Error(`JWT Token verification failed: token signature mismatch`)
              break
            default:
              displayError = new Error(`Encountered Unknown Error: ${verifyError}`)
              break
          }
          setFlashCookie(displayError.message, astroCookies)
          return {
            valid: false,
            displayError: displayError,
            redirect: redirect('/session-error')
          }
        } else {
          displayError = new Error(`Encountered Unknown Error: ${verifyError}`)
          setFlashCookie(displayError.message, astroCookies)
          return {
            valid: false,
            displayError: displayError,
            redirect: redirect('/session-error')
          }
        }
      }
    } else {
      displayError = new Error('Invalid authentication token')
      return {
        valid: false,
        displayError: displayError,
        redirect: redirect('/session-error')
      }
    }
  } else {
    displayError = new Error('Unauthenticated user encountered')
    return {
      valid: false,
      displayError: displayError,
      redirect: redirect('/signin')
    }
  }
}

export async function signoutSession(locals: App.Locals, astroCookies: Readonly<AstroCookies>) {
  const userAuthCookie = getUserAuthCookie(astroCookies)

  if (userAuthCookie) {
    try {
      const db = drizzle(locals.runtime.env.DB, {schema})
      const result = await db.delete(schema.userSessions).where(eq(schema.userSessions.sessionToken, userAuthCookie))

      console.log('signout res: ', result)
    } catch (e) {
      // ignore error
    }
  }

  deleteAllCookies(astroCookies)
}

export function githubNewOauthSigninUrl(astroCookies: Readonly<AstroCookies>) {
  const randomState = randomString()

  setOauthStateCookie(randomState, astroCookies)

  const scopes = ['read:user', 'user:email']

  const authUrl = new URL('https://github.com/login/oauth/authorize')

  const params = new URLSearchParams()
  params.set('client_id', PUBLIC_GITHUB_CLIENT_ID)
  params.set('redirect_uri', GITHUB_OAUTH_REDIRECT_URL)
  params.set('scope', scopes.join(' '))
  params.set('state', randomState)

  authUrl.search = params.toString()

  const authLink = authUrl.href
  return authLink
}

type UserType = typeof schema.users.$inferSelect

export async function githubAuthNewSession(user: UserType, locals: App.Locals, astroCookies: Readonly<AstroCookies>) {
  const exp = addDays(new Date(), 30).valueOf() // 30 days
  // const exp = Math.floor(Date.now() / 1000) + 60 * 1 // 1 minute for testing
  const payload = {
    sub: user.pid,
    role: 'user',
    exp: exp
  }

  const appSecretKey = getSecretAstro('APP_SECRET_KEY', locals)

  const token = await sign(payload, appSecretKey, 'HS256')

  const db = drizzle(locals.runtime.env.DB, {schema})

  const insertedUserSession = await db
    .insert(schema.userSessions)
    .values({
      userId: user.id,
      type: 'jwt',
      sessionToken: token
    })
    .onConflictDoNothing()
    .returning()

  if (insertedUserSession.length === 1) {
    setUserAuthCookie(token, astroCookies)
    setUserProfileCookie(
      {
        githubAvatarUrl: user.githubAvatarUrl,
        githubLogin: user.githubLogin,
        fullName: user.fullName,
        pid: user.pid
      },
      astroCookies
    )
    return redirect('/app/')
  } else {
    throw new Error('Encountered duplicate authentication token')
  }
}

export async function encrypt(data: string, secret: string): Promise<string> {
  const subtle = crypto.subtle
  const encoder = new TextEncoder()

  // Key derivation setup
  const keyMaterial = await subtle.importKey('raw', encoder.encode(secret), {name: 'PBKDF2'}, false, ['deriveKey'])
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const key = await subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    {name: 'AES-GCM', length: 256},
    false,
    ['encrypt']
  )

  // Prepare IV and encrypt data
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encryptedData = await subtle.encrypt({name: 'AES-GCM', iv: iv}, key, encoder.encode(data))

  // Base64 encode the encrypted data and IV
  let binaryString = ''
  const encryptedBytes = new Uint8Array(encryptedData)
  for (const byte of encryptedBytes) {
    binaryString += String.fromCharCode(byte)
  }
  const ciphertext = btoa(binaryString)

  binaryString = ''
  for (const byte of iv) {
    binaryString += String.fromCharCode(byte)
  }
  const ivBase64 = btoa(binaryString)

  return `${ivBase64}:${ciphertext}`
}

export async function decrypt(dataWithIV: string, secret: string): Promise<string> {
  const subtle = crypto.subtle
  const [ivBase64, ciphertext] = dataWithIV.split(':')
  const decoder = new TextDecoder()

  // Convert Base64 to ArrayBuffer for IV and ciphertext
  const iv = new Uint8Array(
    atob(ivBase64)
      .split('')
      .map((char) => char.charCodeAt(0))
  )
  const encryptedData = atob(ciphertext)
    .split('')
    .map((char) => char.charCodeAt(0))

  // Key derivation setup
  const encoder = new TextEncoder()
  const keyMaterial = await subtle.importKey('raw', encoder.encode(secret), {name: 'PBKDF2'}, false, ['deriveKey'])
  const salt = iv.slice(0, 16) // Reuse part of the IV as salt
  const key = await subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    {name: 'AES-GCM', length: 256},
    false,
    ['decrypt']
  )

  // Decrypt data
  const decryptedData = await subtle.decrypt({name: 'AES-GCM', iv: iv}, key, new Uint8Array(encryptedData))

  return decoder.decode(decryptedData)
}

export async function githubAuthUser(userProfile: unknown, locals: App.Locals, astroCookies: Readonly<AstroCookies>) {
  if (userProfile && typeof userProfile === 'object') {
    // continue only if they are a user
    if ('type' in userProfile && userProfile.type === 'User') {
      if ('id' in userProfile && typeof userProfile.id === 'number') {
        const githubId = userProfile.id
        const db = drizzle(locals.runtime.env.DB, {schema})
        if (
          'avatar_url' in userProfile &&
          typeof userProfile.avatar_url === 'string' &&
          'name' in userProfile &&
          typeof userProfile.name === 'string' &&
          'login' in userProfile &&
          typeof userProfile.login === 'string'
        ) {
          const existingUser = await db.query.users.findFirst({
            where: eq(schema.users.githubId, githubId)
          })
          if (existingUser) {
            if (
              existingUser.fullName !== userProfile.name ||
              existingUser.githubAvatarUrl !== userProfile.avatar_url ||
              existingUser.githubLogin !== userProfile.login
            ) {
              const res = await db
                .update(schema.users)
                .set({
                  fullName: userProfile.name,
                  githubAvatarUrl: userProfile.avatar_url,
                  githubLogin: userProfile.login
                })
                .where(eq(schema.users.githubId, githubId))
              if (!res.success) {
                throw new Error('Unable to update user')
              }
            }
            return githubAuthNewSession(existingUser, locals, astroCookies)
          } else {
            let emailValue: string | null = null
            if ('email' in userProfile && typeof userProfile.email === 'string') {
              const appSecret = getSecretAstro('APP_SECRET_KEY', locals)
              emailValue = await encrypt(userProfile.email, appSecret)
            }
            const newUserArr = await db
              .insert(schema.users)
              .values({
                email: emailValue,
                fullName: userProfile.name,
                githubAvatarUrl: userProfile.avatar_url,
                githubId: userProfile.id,
                githubLogin: userProfile.login
              })
              .returning()
            if (newUserArr.length === 1) {
              const newUser = newUserArr[0]
              return githubAuthNewSession(newUser, locals, astroCookies)
            } else {
              throw new Error('Invalid data returned from user creation')
            }
          }
        } else {
          throw new Error('Invalid github user schema given, missing: avatar_url, name or login')
        }
      }
    } else {
      throw new Error('Non-user (Orgs, etc.) are not supported for authentication at this time.')
    }
  } else {
    throw new Error('No github user profile found')
  }
}

export async function fetchGithubUserAccessToken(githubCode: string, locals: App.Locals) {
  const clientSecret = getSecretAstro('GITHUB_CLIENT_SECRET', locals)

  const params = new URLSearchParams()
  params.append('client_id', PUBLIC_GITHUB_CLIENT_ID)
  params.append('client_secret', clientSecret)
  params.append('code', githubCode)
  params.append('redirect_uri', GITHUB_OAUTH_REDIRECT_URL)

  try {
    const tokenUrl = 'https://github.com/login/oauth/access_token'
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'fetch/www.warpdive.xyz'
      },
      body: params.toString()
    })

    if (!response.ok) {
      throw new Error(`GitHub API responded with ${response.status}: ${response.statusText}`)
    }

    const accessTokenResp = await response.json()
    // This will contain the access_token, scope, and token_type
    return accessTokenResp
  } catch (error) {
    console.log('Failed to fetch user access token:', error)
    throw error
  }
}

export async function fetchGithubUserProfile(accessToken: string) {
  try {
    const apiUrl = 'https://api.github.com/user'
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
        'User-Agent': 'fetch/www.warpdive.xyz'
      }
    })

    if (!response.ok) {
      throw new Error(`GitHub API responded with ${response.status}: ${response.statusText}`)
    }

    const userProfile = await response.json() // Parse the JSON response
    return userProfile // This will contain the user profile information
  } catch (error) {
    console.log('Failed to fetch user profile:', error)
    throw error
  }
}
