import {Hono, type Context} from 'hono'
import {HonoServer} from '.'
import * as schema from '@/db/schema'
import {verify, decode} from 'hono/jwt'
import {getSecretPlatform} from '@/secrets'
import {randomString} from '@/lib/random-string'
import {DrizzleD1Database, drizzle} from 'drizzle-orm/d1'
import {eq, sql, and} from 'drizzle-orm'
import {z} from 'zod'
import {zValidator} from '@hono/zod-validator'
import {getAuthenticatedUserDB} from './users'

interface AuthAPIDB {
  db: DrizzleD1Database<typeof schema> | undefined
  currentUser: typeof schema.users.$inferSelect | undefined
}

async function getAuthenticatedAPIDB(apiKey: string, c: Context<HonoServer>): Promise<AuthAPIDB> {
  let displayError: Error | undefined = undefined
  if (c.env) {
    const db = drizzle(c.env.DB, {schema, logger: true})
    if (db) {
      try {
        const appSecret = getSecretPlatform('APP_SECRET_KEY', c)
        const jwt = await verify(apiKey, appSecret, 'HS256')
        if ('sub' in jwt && typeof jwt.sub === 'string' && 'role' in jwt && jwt.role === 'api') {
          const pid = jwt.sub
          const updateRes = await db
            .update(schema.apiKeys)
            .set({
              updatedAt: sql`(CURRENT_TIMESTAMP)`
            })
            .where(eq(schema.apiKeys.pid, pid))
            .returning({
              userId: schema.apiKeys.userId
            })

          console.log(updateRes)
          if (updateRes.length === 1) {
            const userId = updateRes[0].userId
            const userRes = await db.select().from(schema.users).where(eq(schema.users.id, userId))
            if (userRes.length === 1) {
              const currentUser = userRes[0]
              return {
                db,
                currentUser
              }
            } else {
              console.log('No result found or incorrect result finding user')
              return {db, currentUser: undefined}
            }
          } else {
            console.log('No result found or incorrect result finding valid api key')
            return {db, currentUser: undefined}
          }
        } else {
          console.log('Malformed api key payload')
          return {db, currentUser: undefined}
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
              displayError = new Error(`JWT Token verification failed: token expired`)
              break
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
          console.log(displayError.message)
          return {db, currentUser: undefined}
        } else {
          displayError = new Error(`Encountered Unknown Error: ${verifyError}`)
          console.log(displayError.message)
          return {db, currentUser: undefined}
        }
      }
    } else {
      console.log('Failed to initialize drizzle db instance')
    }
  }
  console.log('Failed to find hono context env')
  return {db: undefined, currentUser: undefined}
}

const builds = new Hono<HonoServer>()
  .get('/:pid', zValidator('param', z.object({pid: z.string()})), async (c) => {
    const {pid} = c.req.valid('param')

    const helper = await getAuthenticatedUserDB(c)
    if (helper.currentUser && helper.db) {
      const db = helper.db
      const res = await db
        .select()
        .from(schema.builds)
        .where(and(eq(schema.builds.userId, helper.currentUser.id), eq(schema.builds.pid, pid)))

      if (res.length === 1) {
        const build = res[0]
        const uploadedObject = await c.env.STORAGE.get(build.objectPath)
        if (uploadedObject) {
          const file = await uploadedObject.arrayBuffer()
          return c.body(file, 200)
        } else {
          return c.json({message: 'File not found'}, 404)
        }
      } else {
        return c.json({message: 'Found incorrect build results'}, 500)
      }
    }
    return c.json({message: 'User not found or incorrect authentication'}, 404)
  })
  .post('/new', async (c) => {
    const body = await c.req.parseBody()
    const apiKey = body['api-key']
    const file = body['file']
    if (apiKey && typeof apiKey === 'string') {
      const helper = await getAuthenticatedAPIDB(apiKey, c)
      if (helper.currentUser && helper.currentUser.pid && helper.db) {
        if (file && file instanceof File) {
          const key = randomString()
          const pathKey = key.slice(0, 2) + '/' + key.slice(2, 4) + '/' + key.slice(4)

          //
          // Currently encountering DevalueError: Cannot stringify arbitrary non-POJOs
          // due to github.com/Rich-Harris/devalue not handling Header objects
          // const headers = new Headers()
          // headers.append('If-None-Match', '*')
          // const resp = await c.env.STORAGE.put(key, file, {
          //   onlyIf: headers
          // })

          const uploadObject = await c.env.STORAGE.put(pathKey, file)
          if (uploadObject) {
            const db = helper.db
            const projectName = body['project-name']
            let projectId: number | undefined = undefined
            let projectPid: string | null = null
            if (typeof projectName === 'string') {
              const updateProjectRes = await db
                .update(schema.projects)
                .set({
                  updatedAt: sql`(CURRENT_TIMESTAMP)`
                })
                .where(and(eq(schema.projects.userId, helper.currentUser.id), eq(schema.projects.name, projectName)))
                .returning({
                  id: schema.projects.id,
                  pid: schema.projects.pid
                })
              if (updateProjectRes.length === 1) {
                projectId = updateProjectRes[0].id
                projectPid = updateProjectRes[0].pid
              } else {
                console.log('Unable to find correct project, uploading as untagged')
              }
            }

            if (projectId === undefined) {
              // find untagged project
              const updateProjectRes = await db
                .update(schema.projects)
                .set({
                  updatedAt: sql`(CURRENT_TIMESTAMP)`
                })
                .where(and(eq(schema.projects.userId, helper.currentUser.id), eq(schema.projects.name, '<untagged>')))
                .returning({
                  id: schema.projects.id,
                  pid: schema.projects.pid
                })
              if (updateProjectRes.length === 1) {
                projectId = updateProjectRes[0].id
                projectPid = updateProjectRes[0].pid
              } else if (updateProjectRes.length === 0) {
                // create untagged project
                const newProjectRes = await db
                  .insert(schema.projects)
                  .values({
                    userId: helper.currentUser.id,
                    userPid: helper.currentUser.pid,
                    name: '<untagged>'
                  })
                  .returning({
                    id: schema.projects.id,
                    pid: schema.projects.pid
                  })
                if (newProjectRes.length === 1) {
                  projectId = newProjectRes[0].id
                  projectPid = newProjectRes[0].pid
                } else {
                  console.log('Unable to create <untagged> project')
                  return c.json(
                    {message: 'An unexpected error occurred finding the correct project. Please try again.'},
                    400
                  )
                }
              } else {
                console.log('An unexpected error occurred using the <untagged> project')
                return c.json({message: 'An unexpected error occurred finding the project. Please try again.'}, 400)
              }
            }

            if (projectId && projectPid) {
              const buildRes = await db
                .insert(schema.builds)
                .values({
                  userId: helper.currentUser.id,
                  userPid: helper.currentUser.pid,
                  projectId,
                  projectPid,
                  objectPath: pathKey
                })
                .returning({
                  pid: schema.builds.pid
                })
              if (buildRes.length === 1) {
                const newBuild = buildRes[0]
                return c.json({pid: newBuild.pid, url: `https://www.warpdive.xyz/app/deployment/${newBuild.pid}`}, 200)
              } else {
                console.log('Unexpectedly received multiple build results')
                return c.json({message: 'Unexpected data was encountered. Please try again.'}, 400)
              }
            } else {
              console.log('ERROR: Unable to find build project')
              return c.json(
                {message: 'An unexpected error occurred finding the relevant project. Please try again.'},
                400
              )
            }
          } else {
            return c.json({message: 'Unable to upload file'}, 400)
          }
        } else {
          return c.json({message: 'File not found'}, 400)
        }
      } else {
        return c.json({message: 'Incorrect authentication'}, 400)
      }
    }
    return c.json({message: 'Incorrect authentication'}, 400)
  })

export default builds
export type BuildsType = typeof builds
