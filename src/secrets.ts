// Astro doesn't reflect cloudflare env secrets correctly

import {AstroGlobal} from 'astro'

export function getSecret(key: string, astro: AstroGlobal) {
  const importMetaEnv = import.meta.env
  const astroLocalRuntimeEnv = astro.locals.runtime.env

  if (importMetaEnv[key]) {
    return importMetaEnv[key]
  } else if (astroLocalRuntimeEnv[key]) {
    return astroLocalRuntimeEnv[key]
  }
}
