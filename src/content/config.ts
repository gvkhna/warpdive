import {z, defineCollection} from 'astro:content'

export const collections = {
  blog: defineCollection({
    type: 'content',
    schema: ({image}) =>
      z.object({
        title: z.string(),
        draft: z.boolean().optional(),
        publishedAt: z.string(),
        // image: z.string(),
        image: image().refine((img) => img.width >= 1080, {
          message: 'Cover image must be at least 1080 pixels wide!'
        }),
        summary: z.string(),
        // author: z.string(),
        // authorImg: z.string(),
        tags: z.array(z.string()).refine((tags) => tags.length >= 2, {
          message: 'At least 2 tags are required.'
        })
      })
  }),
  emptyStates: defineCollection({
    type: 'content',
    schema: () => {
      z.object({
        title: z.string(),
        description: z.string()
      })
    }
  })
}
