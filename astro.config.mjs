import 'dotenv/config'
import {URL} from 'node:url'
import path from 'path'
// import untildify from 'untildify'
import fs from 'fs'
import {defineConfig} from 'astro/config'
import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
// import compress from 'astro-compress'
// import partytown from '@astrojs/partytown'
// import compressor from 'astro-compressor'
import node from '@astrojs/node'
import robotsTxt from 'astro-robots-txt'
import Critters from 'astro-critters'

// eslint-disable-next-line no-undef
import cloudflare from '@astrojs/cloudflare'
const PUBLIC_WEB_HOSTNAME = process.env.PUBLIC_WEB_HOSTNAME
// eslint-disable-next-line no-undef
const ASTRO_PORT = process.env.ASTRO_PORT
// eslint-disable-next-line no-undef
const ASTRO_HOST = process.env.ASTRO_HOST
// eslint-disable-next-line no-undef
const RAILS_ENV = process.env.RAILS_ENV
let port
let host
if (ASTRO_PORT) {
  port = parseInt(ASTRO_PORT)
} else {
  port = parseInt(new URL(PUBLIC_WEB_HOSTNAME).port)
}
if (ASTRO_HOST) {
  host = ASTRO_HOST
} else {
  host = new URL(PUBLIC_WEB_HOSTNAME).hostname
}
// eslint-disable-next-line no-console,no-undef
console.log(`ASTRO SITE: ${PUBLIC_WEB_HOSTNAME}, host: ${host} port:${port}`)

// https://astro.build/config
export default defineConfig({
  site: PUBLIC_WEB_HOSTNAME,
  output: 'server',
  server: {
    port: port,
    host: host
  },
  devToolbar: {
    enabled: false
  },
  adapter: cloudflare({
    imageService: 'compile',
    mode: 'advanced'
  }),
  srcDir: './src/',
  publicDir: './public/',
  // trailingSlash: 'always',
  compressHTML: true,
  integrations: [
    react(),
    // media(),

    tailwind({
      applyBaseStyles: false
    }),
    mdx(),
    Critters({
      logger: 0
    }),
    // compress({
    //   logger: 0,
    //   Exclude: ['.png$']
    // }),
    // compressor(),
    // must be last in order
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
      devSourcemap: true
    },
    build: {
      minify: false
    },
    ssr: {
      external: ['node:fs/promises', 'node:url', 'node:os', 'node:path', 'node:crypto']
    }
  }
})
