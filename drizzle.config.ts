// drizzle.config.ts
import {defineConfig} from 'drizzle-kit'

const {LOCAL_DB_PATH, WRANGLER_CONFIG, DB_NAME = 'warpdive-db'} = process.env

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'sqlite',
  driver: 'd1',
  verbose: true,
  strict: true,
  dbCredentials: {
    wranglerConfigPath:
      new URL('wrangler.toml', import.meta.url).pathname +
      // This is a hack to inject additional cli flags to wrangler
      // since drizzle-kit doesn't support specifying environments
      WRANGLER_CONFIG
        ? ` ${WRANGLER_CONFIG}`
        : '',
    dbName: DB_NAME
  }
})
