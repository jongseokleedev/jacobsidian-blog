import { defineCollection } from "astro:content";
import { z } from "zod";
import { glob } from "astro/loaders";
import path from "path";

export const SERIES_PATH = "src/data/series";

export const POSTS_PATH = "src/data/posts";

const posts = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.md",
    base: `./${POSTS_PATH}`,
    generateId: ({ entry }) => {
      // Strip directory and .md extension, preserving locale suffix (e.g. "20210817-1336.en")
      const basename = path.basename(entry, ".md");
      return basename;
    },
  }),
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
      poster: z.string().optional(),
      canonicalURL: z.string().optional(),
      hideEditPost: z.boolean().optional(),
      disableComments: z.boolean().optional(),
      timezone: z.string().optional(),
      lang: z.enum(["ko", "en"]).optional().default("ko"),
      series: z.string().optional(),
      seriesOrder: z.number().optional(),
    }),
});

const series = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.md",
    base: `./${SERIES_PATH}`,
    generateId: ({ entry }) => path.basename(entry, ".md"),
  }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    slug: z.string().optional(),
    category: z.string().optional(),
    description: z.string().optional(),
    nextTitle: z.string().optional(),
  }),
});

export const collections = { posts, series };
