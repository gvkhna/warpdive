import {defineMiddleware} from 'astro/middleware'
import {SessionExpiredError} from '@client'
import debug from 'debug'
const log = debug('app:middleware.ts')
// `context` and `next` are automatically typed
export const onRequest = defineMiddleware(async (context, next) => {
  log(`ASTRO: ${context.request.method} - ${context.request.url}`)
  try {
    const response = await next()
    return response
  } catch (e) {
    log('caught error', e)
    // TODO: catch 14 UNAVAILABLE: No connection established
    if (e instanceof SessionExpiredError) {
      log('caught instance of SessionExpiredError')
      // session expired
      return context.redirect('/expired/', 302)
    } else {
      throw e
    }
  }
})
