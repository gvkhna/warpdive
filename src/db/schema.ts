import {sqliteTable, text, integer, uniqueIndex} from 'drizzle-orm/sqlite-core'
import {sql} from 'drizzle-orm'
import {ulidFactory} from 'ulid-workers'

export const users = sqliteTable(
  'users',
  {
    id: integer('id', {mode: 'number'}).primaryKey({autoIncrement: true}),
    uid: text('uid').$defaultFn(() => {
      const ulid = ulidFactory()
      return ulid()
    }),
    createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text('updated_at').default(sql`(CURRENT_TIMESTAMP)`),
    email: text('email').notNull(),
    fullName: text('full_name')
  },
  (table) => {
    return {
      userIdx: uniqueIndex('uid_idx').on(table.uid),
      emailIdx: uniqueIndex('email_idx').on(table.email)
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
    type: text('type', {enum: ['oauth']}).notNull(),
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
    userId: integer('user_id')
      .references(() => users.id)
      .notNull(),
    jwtToken: text('jwt_token').notNull().unique(),
    active: integer('active', {mode: 'boolean'}).notNull().default(true),
    createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text('updated_at').default(sql`(CURRENT_TIMESTAMP)`)
  },
  (table) => {
    return {
      jwtTokenIdx: uniqueIndex('jwt_token_idx').on(table.jwtToken)
    }
  }
)

export const projects = sqliteTable(
  'projects',
  {
    id: integer('id', {mode: 'number'}).primaryKey({autoIncrement: true}),
    pid: text('pid').$defaultFn(() => {
      const ulid = ulidFactory()
      return ulid()
    }),
    userId: integer('user_id')
      .references(() => users.id)
      .notNull(),
    name: text('name').notNull(),
    org: text('org'),
    repoUrl: text('repo_url'),
    registryUrl: text('registry_url'),
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
      return ulid()
    }),
    repoId: integer('repo_id')
      .references(() => projects.id)
      .notNull(),
    commitSha: text('commit_sha'),
    imageSha: text('image_sha'),
    tag: text('tag'),
    releaseUrl: text('release_url'),
    registryUrl: text('registry_url'),
    builtWith: text('built_with'), // podman,docker
    builtBy: text('built_by'), // user, ci, etc
    objectPath: text('object_path'), // r2 object_path
    createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`)
  },
  (table) => {
    return {
      buildsPublicIdx: uniqueIndex('builds_pid_idx').on(table.pid)
    }
  }
)
