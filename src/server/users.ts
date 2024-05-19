import {Hono} from 'hono'

const users = new Hono().get('/me', (c) => {
  return c.json({hello: 'world'})
})

export default users
export type UsersType = typeof users
