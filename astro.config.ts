import { defineConfig, envField } from "astro/config";
import sitemap from "@astrojs/sitemap";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import { transformerFileName } from "./src/utils/transformers/fileName";
import { SITE } from "./src/config";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";

type PostMeta = { lastmod: string; pubDate: Date };
function buildPostMetaMap(): Map<string, PostMeta> {
  const map = new Map<string, PostMeta>();
  const postsDir = path.resolve("./src/data/posts");
  let entries: string[] = [];
  try {
    entries = readdirSync(postsDir);
  } catch {
    return map;
  }
  for (const entry of entries) {
    if (!entry.endsWith(".md")) continue;
    const isEn = entry.endsWith(".en.md");
    try {
      const raw = readFileSync(path.join(postsDir, entry), "utf8");
      const fm = matter(raw).data as {
        category?: string;
        slug?: string;
        pubDatetime?: string;
        modDatetime?: string | null;
        draft?: boolean;
      };
      if (fm.draft || !fm.category) continue;
      const [parent, sub] = fm.category.split("-");
      if (!parent || !sub) continue;
      const baseName = path.basename(entry, isEn ? ".en.md" : ".md");
      const slug = (fm.slug && String(fm.slug).trim()) || baseName;
      const prefix = isEn ? "en/" : "";
      const urlPath = `/${prefix}${parent}/${sub}/${slug}/`;
      const pub = fm.pubDatetime ? new Date(fm.pubDatetime) : null;
      const mod = fm.modDatetime ? new Date(fm.modDatetime) : pub;
      if (!pub || !mod) continue;
      map.set(urlPath, { lastmod: mod.toISOString(), pubDate: pub });
    } catch { /* skip bad files */ }
  }
  return map;
}
const postMetaMap = buildPostMetaMap();

function priorityForPost(pubDate: Date): number {
  const days = (Date.now() - pubDate.getTime()) / (1000 * 60 * 60 * 24);
  if (days <= 30) return 0.9;
  if (days <= 180) return 0.8;
  if (days <= 365) return 0.7;
  return 0.6;
}

function changefreqForPost(pubDate: Date): "daily" | "weekly" | "monthly" {
  const days = (Date.now() - pubDate.getTime()) / (1000 * 60 * 60 * 24);
  if (days <= 7) return "daily";
  if (days <= 90) return "weekly";
  return "monthly";
}

// https://astro.build/config
export default defineConfig({
  site: SITE.website,
  integrations: [
    sitemap({
      filter: page => {
        if (!SITE.showArchives && page.includes("/archives")) return false;
        if (page.includes("/search")) return false;
        if (/\/tags\/?$/.test(page)) return false;
        // EN 콘텐츠 준비 완료 전까지 /en/ 경로 sitemap 제외
        // 복원하려면 아래 줄을 삭제하세요.
        if (page.includes("/en/")) return false;
        return true;
      },
      changefreq: "weekly",
      priority: 0.7,
      serialize(item) {
        if (item.url === SITE.website || item.url === `${SITE.website}/`) {
          return { ...item, priority: 1.0, changefreq: "daily" as const } as typeof item;
        }
        const pathname = new URL(item.url).pathname;
        const meta = postMetaMap.get(pathname);
        if (meta) {
          return {
            ...item,
            priority: priorityForPost(meta.pubDate),
            changefreq: changefreqForPost(meta.pubDate),
            lastmod: meta.lastmod,
          } as typeof item;
        }
        if (/\/[^/]+\/[^/]+\/[^/]+/.test(pathname)) {
          return { ...item, priority: 0.7, changefreq: "monthly" as const } as typeof item;
        }
        return item;
      },
    }),
  ],
  markdown: {
    remarkPlugins: [remarkToc, [remarkCollapse, { test: "Table of contents" }]],
    shikiConfig: {
      // For more themes, visit https://shiki.style/themes
      themes: { light: "min-light", dark: "night-owl" },
      defaultColor: false,
      wrap: false,
      transformers: [
        transformerFileName({ style: "v2", hideDot: false }),
        transformerNotationHighlight(),
        transformerNotationWordHighlight(),
        transformerNotationDiff({ matchAlgorithm: "v3" }),
      ],
    },
  },
  vite: {
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
    ssr: {
      external: ["@resvg/resvg-js"],
    },
  },
  prefetch: {
    prefetchAll: false,
    defaultStrategy: "hover",
  },
  i18n: {
    defaultLocale: "ko",
    locales: ["ko", "en"],
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },
  image: {
    responsiveStyles: true,
    layout: "constrained",
  },
  env: {
    schema: {
      PUBLIC_GOOGLE_SITE_VERIFICATION: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
      PUBLIC_GA_MEASUREMENT_ID: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
      PUBLIC_ADSENSE_PUBLISHER_ID: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
    },
  },
});
