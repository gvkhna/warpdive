const {PUBLIC_WEB_HOSTNAME} = import.meta.env
export const WARP_DIVE_IMAGE_TYPE_URL = 'type.googleapis.com/warpdive.WarpDiveImage'
export const GITHUB_OAUTH_REDIRECT_URL = `${PUBLIC_WEB_HOSTNAME}/github-callback`

export const siteConfig = {
  name: 'warpdive',
  url: 'https://www.warpdive.xyz',
  ogImage: 'https://www.warpdive.xyz/ogimage.jpg',
  description: 'Docker/OCI Container Layer Browser for your CI. Easy to use. Open Source.',
  links: {
    twitter: 'https://x.com/gvkhna',
    github: 'https://github.com/gvkhna/warpdive'
  }
}

export type SiteConfig = typeof siteConfig
