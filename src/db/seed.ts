import {drizzle} from 'drizzle-orm/d1'
import * as schema from '@/db/schema'
import {getPlatformProxy} from 'wrangler'

const main = async () => {
  const {env} = await getPlatformProxy<Env>()
  const db = drizzle(env.DB, {schema, logger: true})
  const res = await db
    .insert(schema.users)
    .values({
      githubId: 123456789,
      githubLogin: 'gvkhna',
      fullName: 'Gaurav Khanna'
    })
    .returning()

  const user = await db.query.users.findFirst()

  console.log('res: ', res)
  console.log('user: ', user)
  console.log('safe to quit (ctrl+c)')
}
main()
