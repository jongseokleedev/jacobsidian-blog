import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

export const POSTS_PATH = "src/data/posts";

const posts = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: `./${POSTS_PATH}` }),
  schema: ({ image }) =>
    z.object({
      author: z.string().optional(),
      pubDatetime: z.coerce.date(),
      modDatetime: z.coerce.date().optional().nullable(),
      title: z.string(),
      slug: z.string().optional(),
      category: z.enum([
        "essay-thought",
        "essay-journal",
        "tech-dev",
        "tech-work",
        "tech-it",
        "review-book",
        "review-cinema",
        "fiction-novel",
        "fiction-tales",
      ]),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).default(["others"]),
      links: z.array(z.string()).default([]),
      ogImage: image().or(z.string()).optional(),
      description: z.string(),
      canonicalURL: z.string().optional(),
      hideEditPost: z.boolean().optional(),
      timezone: z.string().optional(),
    }),
});

export const collections = { posts };
