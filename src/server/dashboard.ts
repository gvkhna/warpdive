import {eq, desc, getTableColumns, sql} from 'drizzle-orm'
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
      .limit(50)
      .orderBy(desc(schema.projects.updatedAt))

    // alias all columns on join due to issue for joins with drizzle/d1
    // tracking bug: https://github.com/drizzle-team/drizzle-orm/issues/555
    // const {id: buildId, userId: buildUserId, projectId: buildRepoId, ...buildCols} = getTableColumns(schema.builds)
    const recentBuilds = await db
      .selectDistinct({
        builtBy: sql<string | null>`${schema.builds.builtBy}`.as('build_built_by'),
        builtWith: sql<string | null>`${schema.builds.builtWith}`.as('build_built_with'),
        commitSha: sql<string | null>`${schema.builds.commitSha}`.as('build_commit_sha'),
        createdAt: sql<string | null>`${schema.builds.createdAt}`.as('build_created_at'),
        imageSha: sql<string | null>`${schema.builds.imageSha}`.as('build_image_sha'),
        objectPath: sql<string>`${schema.builds.objectPath}`.as('build_object_path'),
        pid: sql<string | null>`${schema.builds.pid}`.as('build_pid'),
        projectCreatedAt: sql<string | null>`${schema.projects.createdAt}`.as('project_created_at'),
        projectName: sql<string>`${schema.projects.name}`.as('project_name'),
        projectOrg: sql<string | null>`${schema.projects.org}`.as('project_org'),
        projectPid: sql<string | null>`${schema.projects.pid}`.as('project_pid'),
        projectPublic: sql<boolean | null>`${schema.projects.public}`.as('project_public'),
        projectRegistryUrl: sql<string | null>`${schema.projects.registryUrl}`.as('project_registry_url'),
        projectRepoUrl: sql<string | null>`${schema.projects.repoUrl}`.as('project_repo_url'),
        projectUpdatedAt: sql<string | null>`${schema.projects.updatedAt}`.as('project_updated_at'),
        registryUrl: sql<string | null>`${schema.builds.registryUrl}`.as('build_registry_url'),
        releaseUrl: sql<string | null>`${schema.builds.releaseUrl}`.as('build_release_url'),
        tag: sql<string | null>`${schema.builds.tag}`.as('build_tag')
      })
      .from(schema.projects)
      .innerJoin(schema.builds, eq(schema.builds.projectId, schema.projects.id))
      .where(eq(schema.projects.userId, userId))
      .limit(50)
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
