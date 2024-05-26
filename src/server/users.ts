import {Hono, type Context} from 'hono'
import {HonoServer} from '.'
import {DrizzleD1Database, drizzle} from 'drizzle-orm/d1'
import {eq, getTableColumns} from 'drizzle-orm'
import * as schema from '@/db/schema'
import {cookieParse} from '@/lib/cookie-parse'
import {USER_AUTH_COOKIE_NAME} from '@/lib/cookies'
import {z} from 'zod'
import {zValidator} from '@hono/zod-validator'
import {sign} from 'hono/jwt'

interface AuthDB {
  db: DrizzleD1Database<typeof schema> | undefined
  currentUser: typeof schema.users.$inferSelect | undefined
}

export async function getAuthenticatedUserDB(c: Context<HonoServer>): Promise<AuthDB> {
  const cookies = c.req.header('cookie')
  if (c.env) {
    const db = drizzle(c.env.DB, {schema, logger: true})
    if (db) {
      if (cookies) {
        const cookieMap = cookieParse(cookies)
        if (cookieMap.has(USER_AUTH_COOKIE_NAME)) {
          const userAuthCookie = cookieMap.get(USER_AUTH_COOKIE_NAME)
          if (userAuthCookie) {
            const userSessionCols = getTableColumns(schema.userSessions)
            const sq = db
              .select({
                userId: userSessionCols.userId
              })
              .from(schema.userSessions)
              .where(eq(schema.userSessions.sessionToken, userAuthCookie))
              .as('sq')
            const result = await db.select().from(schema.users).leftJoin(sq, eq(schema.users.id, sq.userId))
            if (result && result.length === 1) {
              const userData = result[0]
              return {
                db,
                currentUser: userData.users
              }
            } else {
              console.log('No result found or incorrect result')
              return {db, currentUser: undefined}
            }
          } else {
            console.log('Invalid authentication cookie value found')
            return {db, currentUser: undefined}
          }
        } else {
          console.log('No valid cookie authentication found')
          return {db, currentUser: undefined}
        }
      } else {
        console.log('Failed to find Cookie Header')
        return {db, currentUser: undefined}
      }
    } else {
      console.log('Failed to initialize drizzle db instance')
    }
  }
  console.log('Failed to find hono context env')
  return {db: undefined, currentUser: undefined}
}

const users = new Hono<HonoServer>()
  .get('/whoami', async (c) => {
    const helper = await getAuthenticatedUserDB(c)
    if (helper.currentUser) {
      return c.json(helper.currentUser)
    }
    return c.json({message: 'User not found or incorrect authentication'}, 404)
  })
  .post(
    '/api-key/new',
    zValidator(
      'json',
      z.object({
        description: z.string()
      })
    ),
    async (c) => {
      const {description} = c.req.valid('json')

      if (!description) {
        return c.json({message: 'API Key must have a valid description'}, 400)
      }

      const helper = await getAuthenticatedUserDB(c)
      if (helper.currentUser && helper.db) {
        // return c.json(helper.currentUser)
        const db = helper.db
        const res = await db
          .insert(schema.apiKeys)
          .values({
            userId: helper.currentUser.id,
            description
          })
          .returning()
        if (res.length === 1) {
          const apiKey = res[0]
          const payload = {
            sub: apiKey.pid,
            role: 'api'
          }

          if (c.env.APP_SECRET_KEY) {
            const appSecretKey = c.env.APP_SECRET_KEY

            const token = await sign(payload, appSecretKey, 'HS256')

            return c.json(
              {
                apiKey: {
                  ...apiKey,
                  token,
                  id: -1
                }
              },
              200
            )
          } else {
            return c.json({message: 'Was unable to sign api key'}, 500)
          }
        } else {
          return c.json({message: 'Was unable to create valid api key'}, 500)
        }
      }
      return c.json({message: 'User not found or incorrect authentication'}, 404)
    }
  )
  .get('/settings', async (c) => {})
  .get('/delete', async (c) => {
    const helper = await getAuthenticatedUserDB(c)
    if (helper.currentUser) {
      try {
        //
      } catch (e) {
        console.log('delete user error: ', e)
        return c.json({message: 'Unable to delete user, something failed'}, 500)
      }
      return c.json({message: 'Current user successfully deleted'}, 200)
    }
    return c.json({message: 'User not found or incorrect authentication'}, 404)
  })

export default users
export type UsersType = typeof users
