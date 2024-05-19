import {Hono} from 'hono'
import {hc} from 'hono/client'
import users from './users'

const app = new Hono().basePath('/api')

const routes = app.route('/users', users).get('/', (c) => c.json({message: 'Server is healthy'}))

export default app
export type AppType = typeof routes

export const client = hc<AppType>('/')
export type ClientType = typeof client
