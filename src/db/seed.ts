import {drizzle} from 'drizzle-orm/d1'
import * as schema from '@/db/schema'
import {getPlatformProxy} from 'wrangler'

const main = async () => {
  const {env} = await getPlatformProxy<Env>()
  const db = drizzle(env.DB)
  const res = await db.insert(schema.users).values({fullName: 'Test user'}).returning()

  console.log('res: ', res)
  console.log('safe to quit (ctrl+c)')
}
main()
