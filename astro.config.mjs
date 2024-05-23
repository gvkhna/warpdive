import 'dotenv/config'
import {URL} from 'node:url'
import {defineConfig} from 'astro/config'
import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import robotsTxt from 'astro-robots-txt'
import Critters from 'astro-critters'
import cloudflare from '@astrojs/cloudflare'

// eslint-disable-next-line no-undef
const PUBLIC_WEB_HOSTNAME = process.env.PUBLIC_WEB_HOSTNAME
// eslint-disable-next-line no-undef
const MODE = process.env.NODE_ENV
// eslint-disable-next-line no-undef
const DEV = process.env.NODE_ENV === 'development'
// eslint-disable-next-line no-undef
const PROD = process.env.NODE_ENV === 'production'

// eslint-disable-next-line no-console,no-undef
console.log(`ASTRO SITE: ${PUBLIC_WEB_HOSTNAME} ${MODE}`)

export default defineConfig({
  site: PUBLIC_WEB_HOSTNAME,
  output: 'server',
  devToolbar: {
    enabled: false
  },
  adapter: cloudflare({
    imageService: 'compile',
    mode: 'directory',
    platformProxy: {
      enabled: true,
      configPath: 'wrangler.toml',
      persist: true
    }
  }),
  srcDir: './src/',
  publicDir: './public/',
  compressHTML: PROD,
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false
    }),
    mdx(),
    Critters({
      logger: 0
    }),
    sitemap({
      filter: (page) => {
        let sitemapAllow = true
        const filterBases = [
          'app',
          'confirmation',
          'connect',
          'reset-password',
          'xtm.js',
          'expired-token',
          'expired',
          '_image'
        ]
        const url = new URL(page) // Convert the page URL to a URL object

        // Check if the URL pathname starts with any of the filter bases
        if (filterBases.some((base) => url.pathname.startsWith(`/${base}/`))) {
          sitemapAllow = false // Reject the page
        }
        if (url.pathname === '/docs/') {
          sitemapAllow = false
        }
        console.log(`SITEMAP: ${url.pathname} -> ${sitemapAllow}`)
        return sitemapAllow // Include the page
      }
    }),
    robotsTxt()
  ],
  vite: {
    css: {
      devSourcemap: DEV
    },
    build: {
      minify: PROD,
      sourcemap: DEV
    },
    // https://github.com/sveltejs/kit/issues/8140
    optimizeDeps: {exclude: ['fsevents']},
    ssr: {
      //external: ['node:crypto']
    }
  }
})
