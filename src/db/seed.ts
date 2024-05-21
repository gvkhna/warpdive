import {drizzle} from 'drizzle-orm/d1'
import {users} from '@/db/schema'
import {getPlatformProxy} from 'wrangler'

const {env} = await getPlatformProxy<Env>()

const main = async () => {
  const db = drizzle(env.DB)
  await db.insert(users).values({email: 'test@example.test', fullName: 'Test user'})
}
main()
