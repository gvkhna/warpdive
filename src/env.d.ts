/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="@cloudflare/worker-types" />
/// <reference path="../.astro/worker-configuration.d.ts" />

type Runtime = import('@astrojs/cloudflare').Runtime<Env>

declare namespace App {
  interface Locals extends Runtime {
    // otherLocals: {
    //   test: string
    // }
  }
}

interface ImportMetaEnv {
  readonly PUBLIC_WEB_HOSTNAME: string
  readonly PUBLIC_BRAND_NAME: string
  readonly PUBLIC_DEBUG: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
