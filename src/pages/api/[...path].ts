import type {APIRoute} from 'astro'
import app from '@/server/'

const handler: APIRoute = ({request}) => app.fetch(request)

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
