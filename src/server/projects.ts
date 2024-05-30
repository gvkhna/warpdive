import {Hono} from 'hono'
import {HonoServer} from '.'
import * as schema from '@/db/schema'
import {getAuthenticatedUserDB} from './users'
import {z} from 'zod'
import {zValidator} from '@hono/zod-validator'
import {eq, desc, and, getTableColumns, sql} from 'drizzle-orm'

const projects = new Hono<HonoServer>()
  .get('/:pid', zValidator('param', z.object({pid: z.string()})), async (c) => {
    const {pid} = c.req.valid('param')

    const helper = await getAuthenticatedUserDB(c)
    if (helper.currentUser && helper.db) {
      const db = helper.db

      const userId = helper.currentUser.id

      const {id: projectId, userId: projectUserId, ...projectCols} = getTableColumns(schema.projects)
      const projectsRes = await db
        .select(projectCols)
        .from(schema.projects)
        .where(eq(schema.projects.userId, userId))
        .limit(50)
        .orderBy(desc(schema.projects.updatedAt))

      // alias all columns on join due to issue for joins with drizzle/d1
      // tracking bug: https://github.com/drizzle-team/drizzle-orm/issues/555
      // const {id: buildId, userId: buildUserId, projectId: buildRepoId, ...buildCols} = getTableColumns(schema.builds)
      const projectBuilds = await db
        .select({
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
        .where(and(eq(schema.projects.userId, userId), eq(schema.builds.projectPid, pid)))
        .limit(50)
        .orderBy(desc(schema.builds.createdAt))

      if (projects && projectBuilds) {
        console.log(projectBuilds)
        return c.json({projects: projectsRes, projectBuilds}, 200)
      }
      return c.json({message: 'User not found or incorrect authentication'}, 404)
    }
    return c.json({message: 'User not found or incorrect authentication'}, 404)

    // const helper = await getAuthenticatedUserDB(c)
    // if (helper.currentUser && helper.db) {
    //   const db = helper.db

    //   const userId = helper.currentUser.id

    //   const {id: buildId, userId: buildUserId, projectId: buildProjectId, ...buildCols} = getTableColumns(schema.builds)

    //   const builds = await db
    //     .select(buildCols)
    //     .from(schema.builds)
    //     .where(eq(schema.builds.userId, userId))
    //     .limit(50)
    //     .orderBy(desc(schema.builds.createdAt))

    //   return c.json({builds}, 200)
    // }
    // return c.json({message: 'User not found or incorrect authentication'}, 404)
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
