// Astro doesn't reflect cloudflare env secrets correctly

import {AstroGlobal} from 'astro'
import {Context} from 'hono'

export function getSecretAstro(key: string, astro: AstroGlobal) {
  const importMetaEnv = import.meta.env
  const astroLocalRuntimeEnv = astro.locals.runtime.env

  if (importMetaEnv[key]) {
    return importMetaEnv[key]
  } else if (astroLocalRuntimeEnv[key]) {
    return astroLocalRuntimeEnv[key]
  }
}

export function getSecretPlatform(key: string, ctx: Context) {
  const importMetaEnv = import.meta.env
  const contextEnv = ctx.env

  if (importMetaEnv[key]) {
    return importMetaEnv[key]
  } else if (contextEnv[key]) {
    return contextEnv[key]
  }
}
