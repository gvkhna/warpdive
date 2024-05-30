import {Hono} from 'hono'
import {HonoServer} from '.'
import * as schema from '@/db/schema'
import {drizzle} from 'drizzle-orm/d1'
import {eq, and} from 'drizzle-orm'
import {z} from 'zod'
import {zValidator} from '@hono/zod-validator'

const shares = new Hono<HonoServer>().get('/:pid', zValidator('param', z.object({pid: z.string()})), async (c) => {
  const {pid} = c.req.valid('param')

  if (c.env) {
    const db = drizzle(c.env.DB, {schema, logger: true})
    if (db) {
      const res = await db
        .select()
        .from(schema.builds)
        .where(and(eq(schema.builds.pid, pid), eq(schema.builds.public, true)))

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
        console.log('Invalid pid: ', pid)
      }
    } else {
      console.log('Failed to initialize drizzle db instance')
    }
  }
  console.log('Failed to find hono context env')
  return c.json({message: 'Share not found'}, 404)
})

export default shares
export type SharesType = typeof shares
