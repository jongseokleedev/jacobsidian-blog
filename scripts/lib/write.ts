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
  /** Only touch files matching this suffix. Defaults to ".md" (excludes ".en.md"). */
  suffix?: string;
}

export async function cleanOrphans(
  opts: CleanOrphansOptions
): Promise<string[]> {
  const { destDir, keepSlugs, dryRun = false, suffix = ".md" } = opts;

  let entries: string[];
  try {
    entries = await fs.readdir(destDir);
  } catch {
    return [];
  }

  const removed: string[] = [];
  for (const entry of entries) {
    if (!entry.endsWith(suffix)) continue;
    // When managing plain *.md files, skip *.en.md (longer suffix takes priority)
    if (suffix === ".md" && entry.endsWith(".en.md")) continue;
    const slug = entry.slice(0, -suffix.length);
    if (keepSlugs.has(slug)) continue;
    removed.push(entry);
    if (!dryRun) {
      await fs.unlink(path.join(destDir, entry));
    }
  }

  return removed;
}
