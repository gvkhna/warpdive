import {AstroGlobal} from 'astro'
import {drizzle} from 'drizzle-orm/d1'
import {eq} from 'drizzle-orm'
import * as schema from '@/db/schema'
import {decode, sign, verify} from 'hono/jwt'
import {addDays} from 'date-fns'
import {setUserAuthCookie} from './cookies'
import {GITHUB_OAUTH_REDIRECT_URL} from '@/strings'
import {getSecret} from '@/secrets'
const {PUBLIC_WEB_HOSTNAME, GITHUB_CLIENT_SECRET, PUBLIC_GITHUB_CLIENT_ID} = import.meta.env

type UserType = typeof schema.users.$inferSelect

export async function githubAuthSession(user: UserType, astro: AstroGlobal) {
  // const exp = addDays(new Date(), 30).valueOf() // 30 days
  const exp = Math.floor(Date.now() / 1000) + 60 * 1 // 1 minute for testing
  const payload = {
    sub: user.uid,
    role: 'user',
    exp: exp
  }

  const appSecretKey = getSecret('APP_SECRET_KEY', astro)

  const token = await sign(payload, appSecretKey, 'HS256')

  const db = drizzle(astro.locals.runtime.env.DB, {schema})

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
    setUserAuthCookie(token, astro)
    return astro.redirect('/app/')
  } else {
    throw new Error('Encountered duplicate authentication token')
  }
}

export async function githubAuthUser(userProfile: unknown, astro: AstroGlobal) {
  console.log('github auth user', userProfile)
  if (userProfile && typeof userProfile === 'object') {
    // continue only if they are a user
    if ('type' in userProfile && userProfile.type === 'User') {
      if ('id' in userProfile && typeof userProfile.id === 'number') {
        const githubId = userProfile.id
        console.log('github id', githubId)
        const db = drizzle(astro.locals.runtime.env.DB, {schema})
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
          console.log('existing user', existingUser)
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
              console.log('success res? ', res, res.success)
              if (!res.success) {
                throw new Error('Unable to update user')
              }
            }
            return githubAuthSession(existingUser, astro)
          } else {
            const newUserArr = await db
              .insert(schema.users)
              .values({
                fullName: userProfile.name,
                githubAvatarUrl: userProfile.avatar_url,
                githubId: userProfile.id,
                githubLogin: userProfile.login
              })
              .returning()
            if (newUserArr.length === 1) {
              const newUser = newUserArr[0]
              return githubAuthSession(newUser, astro)
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

export async function fetchGithubUserAccessToken(githubCode: string, astro: AstroGlobal) {
  const clientSecret = getSecret('GITHUB_CLIENT_SECRET', astro)

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
    console.error('Failed to fetch user access token:', error)
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
    console.error('Failed to fetch user profile:', error)
    throw error
  }
}
