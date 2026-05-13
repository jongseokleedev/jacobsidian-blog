import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  BOOKS_SOURCE,
  CONTENT_DEST,
  POST_SOURCES,
  VAULT_PATH,
} from "./config";
import { discoverBooks, discoverPosts } from "./lib/discover";
import {
  normalizeBookFrontmatter,
  normalizePostFrontmatter,
  pickSlug,
} from "./lib/normalize";
import { stripObsidianBlocks } from "./lib/transform";
import { cleanOrphans, writeContent } from "./lib/write";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");

interface SyncOptions {
  apply: boolean;
}

function parseArgs(argv: string[]): SyncOptions {
  return { apply: argv.includes("--apply") };
}

async function run(options: SyncOptions) {
  const dryRun = !options.apply;
  const mode = dryRun ? "DRY RUN" : "APPLY";
  console.log(`\n[sync] ${mode} — vault: ${VAULT_PATH}\n`);

  const postsDest = path.join(PROJECT_ROOT, CONTENT_DEST.posts);
  const booksDest = path.join(PROJECT_ROOT, CONTENT_DEST.books);

  const posts = await discoverPosts(VAULT_PATH, POST_SOURCES);
  const books = await discoverBooks(VAULT_PATH, BOOKS_SOURCE);

  console.log(`[sync] discovered ${posts.length} post(s), ${books.length} book(s)`);

  const postSlugs = new Set<string>();
  for (const post of posts) {
    const frontmatter = normalizePostFrontmatter(post.frontmatter, post.category);
    const slug = pickSlug(post.frontmatter, post.absolutePath, frontmatter.title);
    postSlugs.add(slug);
    await writeContent({
      destDir: postsDest,
      slug,
      frontmatter,
      body: stripObsidianBlocks(post.body),
      dryRun,
    });
    console.log(
      `  + post  [${post.category}] ${slug}  ← ${path.relative(VAULT_PATH, post.absolutePath)}`
    );
  }

  const bookSlugs = new Set<string>();
  for (const book of books) {
    const frontmatter = normalizeBookFrontmatter(book.frontmatter);
    const slug = pickSlug(book.frontmatter, book.absolutePath, frontmatter.title);
    bookSlugs.add(slug);
    await writeContent({
      destDir: booksDest,
      slug,
      frontmatter,
      body: stripObsidianBlocks(book.body),
      dryRun,
    });
    console.log(
      `  + book  ${slug}  ← ${path.relative(VAULT_PATH, book.absolutePath)}`
    );
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
    `\n[sync] done. ${posts.length} post(s) + ${books.length} book(s) written, ` +
      `${removedPosts.length + removedBooks.length} orphan(s) removed${dryRun ? " (dry run, no changes)" : ""}.\n`
  );
}

run(parseArgs(process.argv.slice(2))).catch(err => {
  console.error("[sync] failed:", err);
  process.exit(1);
});
