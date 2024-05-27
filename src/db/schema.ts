import {sqliteTable, text, integer, uniqueIndex} from 'drizzle-orm/sqlite-core'
import {sql} from 'drizzle-orm'
import {ulidFactory} from 'ulid-workers'

export const users = sqliteTable(
  'users',
  {
    id: integer('id', {mode: 'number'}).primaryKey({autoIncrement: true}),
    pid: text('pid').$defaultFn(() => {
      const ulid = ulidFactory()
      return ulid().toLowerCase()
    }),
    createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text('updated_at').default(sql`(CURRENT_TIMESTAMP)`),
    // email: text('email').notNull(),
    fullName: text('full_name'),
    githubId: integer('github_id', {mode: 'number'}),
    githubLogin: text('github_login'),
    githubAvatarUrl: text('github_avatar_url')
  },
  (table) => {
    return {
      userPublicIdx: uniqueIndex('user_pid_idx').on(table.pid)
      // emailIdx: uniqueIndex('email_idx').on(table.email)
    }
  }
)

export const userSessions = sqliteTable(
  'user_sessions',
  {
    id: integer('id', {mode: 'number'}).primaryKey({autoIncrement: true}),
    userId: integer('user_id')
      .references(() => users.id)
      .notNull(),
    type: text('type', {enum: ['jwt']}).notNull(),
    sessionToken: text('session_token').notNull().unique(),
    createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text('updated_at').default(sql`(CURRENT_TIMESTAMP)`)
  },
  (table) => {
    return {
      sessionTokenIdx: uniqueIndex('session_token_idx').on(table.sessionToken)
    }
  }
)

export const apiKeys = sqliteTable(
  'api_keys',
  {
    id: integer('id', {mode: 'number'}).primaryKey({autoIncrement: true}),
    pid: text('pid').$defaultFn(() => {
      const ulid = ulidFactory()
      return ulid().toLowerCase()
    }),
    userId: integer('user_id')
      .references(() => users.id)
      .notNull(),
    description: text('description'),
    createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text('updated_at').default(sql`(CURRENT_TIMESTAMP)`)
  },
  (table) => {
    return {
      apiKeyPublicIdx: uniqueIndex('api_key_pid_idx').on(table.pid)
    }
  }
)

export const projects = sqliteTable(
  'projects',
  {
    id: integer('id', {mode: 'number'}).primaryKey({autoIncrement: true}),
    pid: text('pid').$defaultFn(() => {
      const ulid = ulidFactory()
      return ulid().toLowerCase()
    }),
    userId: integer('user_id')
      .references(() => users.id)
      .notNull(),
    userPid: text('user_pid').notNull(),
    name: text('name').notNull(),
    org: text('org'),
    repoUrl: text('repo_url'),
    registryUrl: text('registry_url'),
    public: integer('public', {mode: 'boolean'}),
    createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text('updated_at').default(sql`(CURRENT_TIMESTAMP)`)
  },
  (table) => {
    return {
      projectPublicIdx: uniqueIndex('projects_pid_idx').on(table.pid)
    }
  }
)

export const builds = sqliteTable(
  'builds',
  {
    id: integer('id', {mode: 'number'}).primaryKey({autoIncrement: true}),
    pid: text('pid').$defaultFn(() => {
      const ulid = ulidFactory()
      return ulid().toLowerCase()
    }),
    userId: integer('user_id')
      .references(() => users.id)
      .notNull(),
    userPid: text('user_pid').notNull(),
    projectId: integer('project_id')
      .references(() => projects.id)
      .notNull(),
    projectPid: text('project_pid').notNull(),
    commitSha: text('commit_sha'),
    imageSha: text('image_sha'),
    tag: text('tag'),
    releaseUrl: text('release_url'),
    registryUrl: text('registry_url'),
    builtWith: text('built_with'), // podman, docker
    builtBy: text('built_by'), // user, ci, etc
    objectPath: text('object_path').notNull(), // r2 object_path
    createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`)
  },
  (table) => {
    return {
      buildsPublicIdx: uniqueIndex('builds_pid_idx').on(table.pid)
    }
  }
)
