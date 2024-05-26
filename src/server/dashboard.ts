import {eq, desc, getTableColumns} from 'drizzle-orm'
import {getAuthenticatedUserDB} from './users'
import {Hono} from 'hono'
import {HonoServer} from '.'
import * as schema from '@/db/schema'

const dashboard = new Hono<HonoServer>().get('/', async (c) => {
  const helper = await getAuthenticatedUserDB(c)
  if (helper.currentUser && helper.db) {
    const db = helper.db

    const userId = helper.currentUser.id

    const {id: projectId, userId: projectUserId, ...projectCols} = getTableColumns(schema.projects)
    const projects = await db
      .select(projectCols)
      .from(schema.projects)
      .where(eq(schema.projects.userId, userId))
      .limit(15)
      .orderBy(desc(schema.projects.updatedAt))

    const {id: buildId, userId: buildUserId, projectId: buildRepoId, ...buildCols} = getTableColumns(schema.builds)
    const recentBuilds = await db
      .select(buildCols)
      .from(schema.builds)
      .where(eq(schema.builds.userId, userId))
      .limit(15)
      .orderBy(desc(schema.builds.createdAt))

    if (projects && recentBuilds) {
      return c.json({projects, recentBuilds}, 200)
    }
    return c.json({message: 'User not found or incorrect authentication'}, 404)
  }
  return c.json({message: 'User not found or incorrect authentication'}, 404)
})

export default dashboard
export type DashboardType = typeof dashboard
