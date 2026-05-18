import fg from "fast-glob";
import matter from "gray-matter";
import fs from "node:fs/promises";
import path from "node:path";
import { buildGraphData } from "../src/utils/buildGraph";

const PROJECT_ROOT = path.resolve(import.meta.dirname, "..");

async function loadItems(dir: string) {
  const abs = path.resolve(PROJECT_ROOT, dir);
  const files = await fg("**/*.md", { cwd: abs, absolute: true });
  const results = await Promise.all(
    files.map(async f => {
      const raw = await fs.readFile(f, "utf8");
      const { data } = matter(raw);
      if (data.draft) return null;
      const id = path.basename(f, ".md");
      const category = data.category as string | undefined;
      const [parent, sub] = (category ?? "").split("-");
      const url = parent && sub ? `/${parent}/${sub}/${id}` : `/tech/${id}`;
      const rawDate = data.pubDatetime as string | Date | undefined;
      const pubDatetime = rawDate ? new Date(rawDate).toISOString() : undefined;
      return {
        id,
        slug: id,
        title: (data.title as string) ?? id,
        tags: (data.tags as string[]) ?? [],
        links: (data.links as string[]) ?? [],
        url,
        type: "post" as const,
        category,
        pubDatetime,
      };
    })
  );
  return results.filter((x): x is NonNullable<typeof x> => x !== null);
}

async function main() {
  const posts = await loadItems("src/data/posts");
  const graph = buildGraphData(posts);
  const outPath = path.resolve(PROJECT_ROOT, "public/graph.json");
  await fs.writeFile(outPath, JSON.stringify(graph, null, 2));
  // eslint-disable-next-line no-console
  console.log(`[graph] ${graph.nodes.length} nodes, ${graph.edges.length} edges → public/graph.json`);
}

main();
