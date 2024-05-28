import {Hono} from 'hono'
import {HonoServer} from '.'
import * as schema from '@/db/schema'
import {getAuthenticatedUserDB} from './users'
import {z} from 'zod'
import {zValidator} from '@hono/zod-validator'
import {eq, desc, getTableColumns, sql} from 'drizzle-orm'

const projects = new Hono<HonoServer>()
  .get('/:pid', zValidator('param', z.object({pid: z.string()})), async (c) => {
    const {pid} = c.req.valid('param')

    const helper = await getAuthenticatedUserDB(c)
    if (helper.currentUser && helper.db) {
      const db = helper.db

      const userId = helper.currentUser.id

      const {id: buildId, userId: buildUserId, projectId: buildProjectId, ...buildCols} = getTableColumns(schema.builds)

      const builds = await db
        .select(buildCols)
        .from(schema.builds)
        .where(eq(schema.builds.userId, userId))
        .limit(50)
        .orderBy(desc(schema.builds.createdAt))

      return c.json({builds}, 200)
    }
    return c.json({message: 'User not found or incorrect authentication'}, 404)
  })
  .post(
    '/new',
    zValidator(
      'json',
      z.object({
        name: z.string(),
        url: z.string().optional()
      })
    ),
    async (c) => {
      console.log('receiving body: ', c.req)
      const {name, url} = c.req.valid('json')

      if (!name || name.includes(' ')) {
        return c.json({message: 'Project must have a valid name, no spaces'}, 400)
      }

      if (name === '<untagged>') {
        return c.json({message: 'Cannot create a project with name `<untagged>`'}, 400)
      }

      const helper = await getAuthenticatedUserDB(c)
      console.log('helper: ', helper.currentUser)
      if (helper.currentUser && helper.currentUser.pid && helper.db) {
        const db = helper.db

        const res = await db
          .insert(schema.projects)
          .values({
            userId: helper.currentUser.id,
            userPid: helper.currentUser.pid,
            name: name,
            repoUrl: url
          })
          .returning()
        if (res.length === 1) {
          const newProject = res[0]
          return c.json(
            {
              project: {
                ...newProject,
                id: -1,
                userId: -1
              }
            },
            200
          )
        }
        return c.json({message: 'Something unexpected occurred, failed to create new project'}, 500)
      }
      return c.json({message: 'User not found or incorrect authentication'}, 404)
    }
  )

export default projects
export type ProjectsType = typeof projects
