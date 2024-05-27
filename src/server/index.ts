import {Hono} from 'hono'
import users from './users'
import projects from './projects'
import dashboard from './dashboard'
import builds from './builds'

type HonoBindings = {
  DB: D1Database
  STORAGE: R2Bucket
  APP_SECRET_KEY: string | null
}

export type HonoServer = {Bindings: HonoBindings}

const app = new Hono<HonoServer>().basePath('/api')

const routes = app
  .route('/dashboard', dashboard)
  .route('/users', users)
  .route('/projects', projects)
  .route('/builds', builds)
  .get('/', (c) => c.json({message: 'Server is healthy'}, 200))

export default app
export type AppType = typeof routes
