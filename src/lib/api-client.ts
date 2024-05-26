import type {AppType} from '@/server'
import {hc} from 'hono/client'
const {PUBLIC_WEB_HOSTNAME} = import.meta.env
export const {api} = hc<AppType>(`${PUBLIC_WEB_HOSTNAME || 'http://localhost:4321'}`, {
  fetch: (input, init) => {
    return globalThis.fetch(input, {
      ...init,
      credentials: 'include'
    })
  }
})
export default api
