/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare module 'aos/dist/aos.js'

interface ImportMetaEnv {
  readonly PUBLIC_GRPC_HOSTNAME: string
  readonly PUBLIC_GRPCWEB_HOSTNAME: string
  readonly PUBLIC_WEB_HOSTNAME: string
  readonly PUBLIC_GTAG_ID: string
  readonly PUBLIC_BRAND_NAME: string
  readonly PUBLIC_DEBUG: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
