import type {AppType} from '../server'
const {PUBLIC_WEB_HOSTNAME} = import.meta.env
import {hc} from 'hono/client'
export const {api} = hc<AppType>(`${PUBLIC_WEB_HOSTNAME}/`)
export default api
