import type {APIRoute} from 'astro'
import app from '@/server/'

const handler: APIRoute = (ctx) => app.fetch(ctx.request, ctx.locals.runtime.env)

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as DELETE,
  handler as HEAD,
  handler as PATCH,
  handler as TRACE,
  handler as OPTIONS,
  handler as CONNECT
}
