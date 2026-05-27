import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import fs from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  ATTACHMENTS_SOURCE,
  CONTENT_DEST,
  EN_POST_SOURCES,
  PUBLIC_IMAGE_URL,
  VAULT_PATH,
  type PostCategory,
} from "./config";
import { discoverPosts } from "./lib/discover";
import {
  normalizePostFrontmatter,
  pickSlug,
} from "./lib/normalize";
import { buildLinkMap, type LinkEntry } from "./lib/linkMap";
import {
  extractWikilinks,
  stripLeadingH1,
  transformCallouts,
  stripObsidianBlocks,
  transformImageEmbeds,
  transformTransclusions,
  transformWikilinks,
  type ImageResolver,
  type NoteBodyResolver,
} from "./lib/transform";
import { cleanOrphans, writeContent } from "./lib/write";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");

const CATEGORY_TO_SEGMENT: Record<PostCategory, string> = {
  "essay-thought": "essay/thought",
  "essay-journal": "essay/journal",
  "tech-dev":      "tech/dev",
  "tech-work":     "tech/work",
  "tech-it":       "tech/it",
  "review-book":   "review/book",
  "review-cinema": "review/cinema",
  "fiction-novel": "fiction/novel",
  "fiction-tales": "fiction/tales",
};

interface SyncOptions {
  apply: boolean;
}

function parseArgs(argv: string[]): SyncOptions {
  return { apply: argv.includes("--apply") };
}

function createImageResolver(
  imagesDest: string,
  copiedImages: Set<string>,
  dryRun: boolean
): ImageResolver {
  const attachmentsRoot = path.join(VAULT_PATH, ATTACHMENTS_SOURCE);
  return name => {
    const srcPath = path.join(attachmentsRoot, name);
    if (!existsSync(srcPath)) return null;

    if (!copiedImages.has(name)) {
      copiedImages.add(name);
      if (!dryRun) {
        mkdirSync(imagesDest, { recursive: true });
        copyFileSync(srcPath, path.join(imagesDest, name));
      }
    }
    return `${PUBLIC_IMAGE_URL}/${encodeURIComponent(name)}`;
  };
}

async function run(options: SyncOptions) {
  const dryRun = !options.apply;
  const mode = dryRun ? "DRY RUN" : "APPLY";
  console.log(`\n[sync:en] ${mode} — vault: ${VAULT_PATH}\n`);

  const postsDest = path.join(PROJECT_ROOT, CONTENT_DEST.posts);
  const imagesDest = path.join(PROJECT_ROOT, CONTENT_DEST.images);

  const posts = await discoverPosts(VAULT_PATH, EN_POST_SOURCES);
  console.log(`[sync:en] discovered ${posts.length} English post(s)`);

  interface Resolved<T> {
    item: T;
    slug: string;
    title: string;
    basename: string;
    body: string;
    url: string;
  }

  function deduplicateSlugs<T>(
    items: T[],
    getSlug: (item: T) => string
  ): string[] {
    const seen = new Map<string, number>();
    return items.map(item => {
      const base = getSlug(item);
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      return count === 0 ? base : `${base}-${count + 1}`;
    });
  }

  const postSlugsRaw = posts.map(post =>
    pickSlug(post.frontmatter, post.absolutePath, String(post.frontmatter.title ?? "Untitled"))
  );
  const postSlugsFinal = deduplicateSlugs(postSlugsRaw, s => s);

  const resolvedPosts: Resolved<(typeof posts)[number]>[] = posts.map((post, i) => {
    const title = String(post.frontmatter.title ?? "Untitled");
    const slug = postSlugsFinal[i];
    const basename = path.basename(post.absolutePath, ".md");
    return {
      item: post,
      slug,
      title,
      basename,
      body: post.body,
      url: `/en/${CATEGORY_TO_SEGMENT[post.category]}/${slug}/`,
    };
  });

  const postEntries: LinkEntry[] = resolvedPosts.map(r => ({
    basename: r.basename,
    slug: r.slug,
    title: r.title,
    url: r.url,
  }));

  const linkMap = buildLinkMap(postEntries);

  const bodyByName = new Map<string, string>();
  for (const r of resolvedPosts) {
    bodyByName.set(r.basename, r.body);
    bodyByName.set(r.title, r.body);
    bodyByName.set(r.slug, r.body);
  }
  const noteBodyResolver: NoteBodyResolver = name => bodyByName.get(name) ?? null;

  const copiedImages = new Set<string>();
  const imageResolver = createImageResolver(imagesDest, copiedImages, dryRun);

  function applyTransforms(body: string): string {
    let out = body;
    out = stripLeadingH1(out);
    out = transformCallouts(out);
    out = transformTransclusions(out, noteBodyResolver);
    out = transformWikilinks(out, linkMap);
    out = transformImageEmbeds(out, imageResolver);
    out = stripObsidianBlocks(out);
    if (out.startsWith("---")) out = "\n" + out;
    out = out.replace(/\n\*[^\n]+\*\s*$/, "");
    out = out.replace(/\n---\s*$/, "");
    return out;
  }

  // Write slug back to vault file if it was missing
  async function writeSlugToVault(absolutePath: string, slug: string): Promise<void> {
    const raw = await fs.readFile(absolutePath, "utf8");
    const hasFm = raw.trimStart().startsWith("---");
    if (!hasFm) return;
    const fmEnd = raw.indexOf("---", raw.indexOf("---") + 3);
    if (fmEnd === -1) return;
    const fmBlock = raw.slice(0, fmEnd + 3);
    if (/^slug:\s*\S/m.test(fmBlock)) return;
    let updated: string;
    if (/^slug:/m.test(fmBlock)) {
      updated = raw.replace(/^slug:.*$/m, `slug: ${slug}`);
    } else {
      const firstEnd = raw.indexOf("\n", raw.indexOf("---")) + 1;
      updated = raw.slice(0, firstEnd) + `slug: ${slug}\n` + raw.slice(firstEnd);
    }
    await fs.writeFile(absolutePath, updated, "utf8");
  }

  const postSlugs = new Set<string>();
  for (const r of resolvedPosts) {
    postSlugs.add(r.slug);
    const links = extractWikilinks(r.body);
    const frontmatter = normalizePostFrontmatter(
      { ...r.item.frontmatter, links, lang: "en" },
      r.item.category,
      r.slug
    );
    // Write as <slug>.en.md
    await writeContent({
      destDir: postsDest,
      slug: `${r.slug}.en`,
      frontmatter,
      body: applyTransforms(r.body),
      dryRun,
    });
    if (!dryRun) {
      const hadSlug = typeof r.item.frontmatter.slug === "string" && r.item.frontmatter.slug.trim();
      if (!hadSlug) await writeSlugToVault(r.item.absolutePath, r.slug);
    }
    console.log(
      `  + post  [${r.item.category}] ${r.slug}.en  ← ${path.relative(VAULT_PATH, r.item.absolutePath)}`
    );
  }

  if (copiedImages.size > 0) {
    console.log(`  · images: ${copiedImages.size} copied → ${path.relative(PROJECT_ROOT, imagesDest)}/`);
  }

  // Clean orphan *.en.md files whose Korean slug no longer exists in English vault
  const removedPosts = await cleanOrphans({
    destDir: postsDest,
    keepSlugs: postSlugs,
    suffix: ".en.md",
    dryRun,
  });
  for (const file of removedPosts) console.log(`  - post  ${file}`);

  console.log(
    `\n[sync:en] done. ${resolvedPosts.length} English post(s) written, ` +
      `${removedPosts.length} orphan(s) removed${dryRun ? " (dry run, no changes)" : ""}.\n`
  );

  if (!dryRun) {
    const date = new Date().toISOString().slice(0, 10);
    const git = (args: string[]) => execFileSync("git", args, { cwd: PROJECT_ROOT, stdio: "inherit" });
    const gitOut = (args: string[]) => execFileSync("git", args, { cwd: PROJECT_ROOT }).toString().trim();
    try {
      git(["add", "src/data/", "public/images/"]);
      const diff = gitOut(["diff", "--cached", "--name-only"]);
      if (!diff) {
        console.log("[sync:en] nothing to commit — English content is up to date.\n");
        return;
      }
      git(["commit", "-m", `content: sync English posts from Obsidian vault (${date})`]);
      git(["push", "origin", "main"]);
      console.log("[sync:en] deployed successfully.\n");
    } catch (err) {
      console.error("[sync:en] deploy failed:", err);
      process.exit(1);
    }
  }
}

run(parseArgs(process.argv.slice(2))).catch(err => {
  console.error("[sync:en] failed:", err);
  process.exit(1);
});
