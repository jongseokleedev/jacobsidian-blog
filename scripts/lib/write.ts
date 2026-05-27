import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

export interface WriteContentOptions {
  destDir: string;
  slug: string;
  frontmatter: object;
  body: string;
  dryRun?: boolean;
}

export async function writeContent(opts: WriteContentOptions): Promise<string> {
  const { destDir, slug, frontmatter, body, dryRun = false } = opts;
  const filePath = path.join(destDir, `${slug}.md`);
  let serialized = matter.stringify(body, frontmatter as Record<string, unknown>);
  // gray-matter occasionally omits the opening --- when body is empty or starts
  // with a character sequence it misidentifies. Ensure the file always starts
  // with a valid YAML front-matter delimiter.
  if (!serialized.startsWith("---")) serialized = "---\n" + serialized;

  if (!dryRun) {
    await fs.mkdir(destDir, { recursive: true });
    await fs.writeFile(filePath, serialized, "utf8");
  }

  return filePath;
}

export interface CleanOrphansOptions {
  destDir: string;
  keepSlugs: Set<string>;
  dryRun?: boolean;
}

export async function cleanOrphans(
  opts: CleanOrphansOptions
): Promise<string[]> {
  const { destDir, keepSlugs, dryRun = false } = opts;

  let entries: string[];
  try {
    entries = await fs.readdir(destDir);
  } catch {
    return [];
  }

  const removed: string[] = [];
  for (const entry of entries) {
    if (!entry.endsWith(".md")) continue;
    if (entry.endsWith(".en.md")) continue; // English translations managed separately
    const slug = entry.slice(0, -".md".length);
    if (keepSlugs.has(slug)) continue;
    removed.push(entry);
    if (!dryRun) {
      await fs.unlink(path.join(destDir, entry));
    }
  }

  return removed;
}
