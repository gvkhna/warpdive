import {getPlatformProxy} from 'wrangler'
import {drizzle} from 'drizzle-orm/d1'
import * as schema from '@/db/schema'
import {decode, sign, verify} from 'hono/jwt'
import {addDays} from 'date-fns/esm'

// pnpm jest db.test.ts
test('database mock testing', async () => {
  // TODO: setup a testing db setup
})
