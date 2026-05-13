import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  ATTACHMENTS_SOURCE,
  BOOKS_SOURCE,
  CONTENT_DEST,
  POST_SOURCES,
  PUBLIC_IMAGE_URL,
  VAULT_PATH,
  type PostCategory,
} from "./config";
import { discoverBooks, discoverPosts } from "./lib/discover";
import {
  normalizeBookFrontmatter,
  normalizePostFrontmatter,
  pickSlug,
} from "./lib/normalize";
import { buildLinkMap, type LinkEntry } from "./lib/linkMap";
import {
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
  thought: "thoughts",
  writing: "writing",
  tech: "tech",
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
  console.log(`\n[sync] ${mode} — vault: ${VAULT_PATH}\n`);

  const postsDest = path.join(PROJECT_ROOT, CONTENT_DEST.posts);
  const booksDest = path.join(PROJECT_ROOT, CONTENT_DEST.books);
  const imagesDest = path.join(PROJECT_ROOT, CONTENT_DEST.images);

  const posts = await discoverPosts(VAULT_PATH, POST_SOURCES);
  const books = await discoverBooks(VAULT_PATH, BOOKS_SOURCE);
  console.log(`[sync] discovered ${posts.length} post(s), ${books.length} book(s)`);

  // Pass 1: decide slugs + build link/body maps
  interface Resolved<T> {
    item: T;
    slug: string;
    title: string;
    basename: string;
    body: string;
    url: string;
  }

  const resolvedPosts: Resolved<(typeof posts)[number]>[] = posts.map(post => {
    const title = String(post.frontmatter.title ?? "Untitled");
    const slug = pickSlug(post.frontmatter, post.absolutePath, title);
    const basename = path.basename(post.absolutePath, ".md");
    return {
      item: post,
      slug,
      title,
      basename,
      body: post.body,
      url: `/${CATEGORY_TO_SEGMENT[post.category]}/${slug}/`,
    };
  });

  const resolvedBooks: Resolved<(typeof books)[number]>[] = books.map(book => {
    const title = String(book.frontmatter.title ?? "Untitled");
    const slug = pickSlug(book.frontmatter, book.absolutePath, title);
    const basename = path.basename(book.absolutePath, ".md");
    return {
      item: book,
      slug,
      title,
      basename,
      body: book.body,
      url: `/books/${slug}/`,
    };
  });

  const postEntries: LinkEntry[] = resolvedPosts.map(r => ({
    basename: r.basename,
    slug: r.slug,
    title: r.title,
    url: r.url,
  }));
  const bookEntries: LinkEntry[] = resolvedBooks.map(r => ({
    basename: r.basename,
    slug: r.slug,
    title: r.title,
    url: r.url,
  }));

  const linkMap = buildLinkMap(postEntries, bookEntries);

  const bodyByName = new Map<string, string>();
  for (const r of [...resolvedPosts, ...resolvedBooks]) {
    bodyByName.set(r.basename, r.body);
    bodyByName.set(r.title, r.body);
    bodyByName.set(r.slug, r.body);
  }
  const noteBodyResolver: NoteBodyResolver = name => bodyByName.get(name) ?? null;

  const copiedImages = new Set<string>();
  const imageResolver = createImageResolver(imagesDest, copiedImages, dryRun);

  function applyTransforms(body: string): string {
    let out = body;
    out = transformTransclusions(out, noteBodyResolver);
    out = transformWikilinks(out, linkMap);
    out = transformImageEmbeds(out, imageResolver);
    out = stripObsidianBlocks(out);
    return out;
  }

  // Pass 2: write
  const postSlugs = new Set<string>();
  for (const r of resolvedPosts) {
    postSlugs.add(r.slug);
    const frontmatter = normalizePostFrontmatter(
      r.item.frontmatter,
      r.item.category
    );
    await writeContent({
      destDir: postsDest,
      slug: r.slug,
      frontmatter,
      body: applyTransforms(r.body),
      dryRun,
    });
    console.log(
      `  + post  [${r.item.category}] ${r.slug}  ← ${path.relative(VAULT_PATH, r.item.absolutePath)}`
    );
  }

  const bookSlugs = new Set<string>();
  for (const r of resolvedBooks) {
    bookSlugs.add(r.slug);
    const frontmatter = normalizeBookFrontmatter(r.item.frontmatter);
    await writeContent({
      destDir: booksDest,
      slug: r.slug,
      frontmatter,
      body: applyTransforms(r.body),
      dryRun,
    });
    console.log(
      `  + book  ${r.slug}  ← ${path.relative(VAULT_PATH, r.item.absolutePath)}`
    );
  }

  if (copiedImages.size > 0) {
    console.log(`  · images: ${copiedImages.size} copied → ${path.relative(PROJECT_ROOT, imagesDest)}/`);
  }

  const removedPosts = await cleanOrphans({
    destDir: postsDest,
    keepSlugs: postSlugs,
    dryRun,
  });
  const removedBooks = await cleanOrphans({
    destDir: booksDest,
    keepSlugs: bookSlugs,
    dryRun,
  });
  for (const file of removedPosts) console.log(`  - post  ${file}`);
  for (const file of removedBooks) console.log(`  - book  ${file}`);

  console.log(
    `\n[sync] done. ${resolvedPosts.length} post(s) + ${resolvedBooks.length} book(s) written, ` +
      `${removedPosts.length + removedBooks.length} orphan(s) removed${dryRun ? " (dry run, no changes)" : ""}.\n`
  );
}

run(parseArgs(process.argv.slice(2))).catch(err => {
  console.error("[sync] failed:", err);
  process.exit(1);
});
