import type { APIRoute } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";
import { getPath } from "@/utils/getPath";
import { SITE } from "@/config";

type Entry = CollectionEntry<"posts">;

const isPublishable = ({ data }: Entry) => {
  const isPublishTimePassed =
    Date.now() > new Date(data.pubDatetime).getTime() - SITE.scheduledPostMargin;
  return !data.draft && (import.meta.env.DEV || isPublishTimePassed);
};

const sortKey = (e: Entry) =>
  new Date(e.data.modDatetime ?? e.data.pubDatetime).getTime();

const CATEGORY_LABELS: Record<string, string> = {
  "essay-thought": "Essay / Thought",
  "essay-journal": "Essay / Journal",
  "tech-dev":      "Tech / Dev",
  "tech-work":     "Tech / Work",
  "tech-it":       "Tech / IT",
  "review-book":   "Review / Book",
  "review-cinema": "Review / Cinema",
  "fiction-novel": "Fiction / Novel",
  "fiction-tales": "Fiction / Tales",
};

export const GET: APIRoute = async ({ site }) => {
  const posts = await getCollection("posts");
  const entries = posts
    .filter(isPublishable)
    .sort((a, b) => sortKey(b) - sortKey(a));

  const base = site ?? new URL(SITE.website);

  // Group by category
  const byCategory = new Map<string, Entry[]>();
  for (const entry of entries) {
    const cat = entry.data.category;
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(entry);
  }

  const lines: string[] = [
    `# ${SITE.title}`,
    ``,
    `> ${SITE.desc}`,
    ``,
    `## About`,
    ``,
    `Author: ${SITE.author}`,
    `Language: Korean (한국어)`,
    `Site: ${SITE.website}`,
    `RSS: ${new URL("rss.xml", base).href}`,
    ``,
    `jacobsidian is a personal blog written in Korean. It covers essays and personal reflections,`,
    `technology and software development, book and film reviews, and short fiction.`,
    ``,
    `## Content`,
    ``,
  ];

  for (const [cat, catEntries] of byCategory) {
    lines.push(`### ${CATEGORY_LABELS[cat] ?? cat}`);
    lines.push(``);
    for (const entry of catEntries) {
      const url = new URL(getPath(entry), base).href;
      lines.push(`- [${entry.data.title}](${url}): ${entry.data.description}`);
    }
    lines.push(``);
  }

  lines.push(`## Full content`);
  lines.push(``);
  lines.push(`For full article content, fetch each URL above directly.`);
  lines.push(`A machine-readable feed is available at: ${new URL("rss.xml", base).href}`);
  lines.push(``);

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
