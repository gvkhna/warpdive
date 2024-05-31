// Astro doesn't reflect cloudflare env secrets correctly

import {Context} from 'hono'

export function getSecretAstro(key: string, locals: App.Locals) {
  console.log('import env', import.meta.env)
  console.log('astro env', locals.runtime.env)
  if (import.meta && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key]
  } else if (locals && locals.runtime && locals.runtime.env && locals.runtime.env[key]) {
    return locals.runtime.env[key]
  } else {
    throw new Error(`Unable to get astro secret: ${key}`)
  }
}

export function getSecretPlatform(key: string, ctx: Context) {
  const importMetaEnv = import.meta.env
  const contextEnv = ctx.env

  if (import.meta && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key]
  } else if (ctx && ctx.env[key]) {
    return ctx.env[key]
  } else {
    throw new Error(`Unable to get platform secret: ${key} `)
  }
}
