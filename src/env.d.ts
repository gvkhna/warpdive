/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

// declare module 'aos/dist/aos.js'

interface ImportMetaEnv {
  readonly PUBLIC_WEB_HOSTNAME: string
  readonly PUBLIC_BRAND_NAME: string
  readonly PUBLIC_DEBUG: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
