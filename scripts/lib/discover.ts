import fs from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import matter from "gray-matter";
import type { PostCategory } from "../config";

export interface DiscoveredPost {
  category: PostCategory;
  absolutePath: string;
  relativePath: string;
  frontmatter: Record<string, unknown>;
  body: string;
}

export interface DiscoveredBook {
  absolutePath: string;
  relativePath: string;
  frontmatter: Record<string, unknown>;
  body: string;
}

async function exists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

// Obsidian meta-bind sometimes prepends new frontmatter blocks instead of
// updating existing ones, resulting in N consecutive --- blocks.
// Parse all of them and merge (later blocks win on conflict).
async function readMarkdown(absolutePath: string) {
  const raw = await fs.readFile(absolutePath, "utf8");
  let rest = raw.trimStart();

  const fmRe = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
  let merged: Record<string, unknown> = {};
  let lastBody = "";
  let matched = false;

  while (true) {
    const m = rest.match(fmRe);
    if (!m) break;
    const parsed = matter("---\n" + m[1] + "\n---");
    merged = { ...merged, ...parsed.data };
    rest = rest.slice(m[0].length).trimStart();
    lastBody = rest;
    matched = true;
  }

  if (!matched) {
    const { data, content } = matter(rest);
    return { frontmatter: data as Record<string, unknown>, body: content };
  }

  return { frontmatter: merged, body: lastBody };
}

export async function discoverPosts(
  vaultPath: string,
  sources: Partial<Record<PostCategory, string>>
): Promise<DiscoveredPost[]> {
  const results: DiscoveredPost[] = [];

  for (const [category, relSource] of Object.entries(sources) as [
    PostCategory,
    string,
  ][]) {
    const sourceDir = path.join(vaultPath, relSource);
    if (!(await exists(sourceDir))) continue;

    const files = await fg("**/*.md", {
      cwd: sourceDir,
      absolute: true,
      dot: false,
    });

    for (const absolutePath of files) {
      const { frontmatter, body } = await readMarkdown(absolutePath);
      const isPublished =
        frontmatter.status === "published" || frontmatter.published === true;
      if (!isPublished) continue;

      results.push({
        category,
        absolutePath,
        relativePath: path.relative(vaultPath, absolutePath),
        frontmatter,
        body,
      });
    }
  }

  return results;
}

export async function discoverBooks(
  vaultPath: string,
  source: string
): Promise<DiscoveredBook[]> {
  const sourceDir = path.join(vaultPath, source);
  if (!(await exists(sourceDir))) return [];

  const files = await fg("**/*.md", {
    cwd: sourceDir,
    absolute: true,
    dot: false,
  });

  const results: DiscoveredBook[] = [];
  for (const absolutePath of files) {
    const { frontmatter, body } = await readMarkdown(absolutePath);
    if (frontmatter.published !== true) continue;

    results.push({
      absolutePath,
      relativePath: path.relative(vaultPath, absolutePath),
      frontmatter,
      body,
    });
  }

  return results;
}
