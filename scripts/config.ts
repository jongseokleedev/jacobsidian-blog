import path from "node:path";
import os from "node:os";

export const VAULT_PATH = path.join(
  os.homedir(),
  "Library/Mobile Documents/iCloud~md~obsidian/Documents/jacobsidian"
);

const PUBLIC_BASE = "020.Area/022.Writing/022-1.Public";

export const POST_SOURCES = {
  "essay-thought": path.join(PUBLIC_BASE, "Essay/Thought"),
  "essay-journal": path.join(PUBLIC_BASE, "Essay/Journal"),
  "tech-dev":      path.join(PUBLIC_BASE, "Tech/Dev"),
  "tech-work":     path.join(PUBLIC_BASE, "Tech/Work"),
  "tech-it":       path.join(PUBLIC_BASE, "Tech/IT"),
  "review-book":   path.join(PUBLIC_BASE, "Review/Book"),
  "review-cinema": path.join(PUBLIC_BASE, "Review/Cinema"),
  "fiction-novel": path.join(PUBLIC_BASE, "Fiction/Novel"),
  "fiction-tales": path.join(PUBLIC_BASE, "Fiction/Tales"),
} as const;

// Only categories being translated to English.
// Add/remove entries here to control which categories appear under /en/.
export const EN_POST_SOURCES = {
  "essay-thought": path.join(PUBLIC_BASE, "Essay-EN/Thought"),
  "essay-journal": path.join(PUBLIC_BASE, "Essay-EN/Journal"),
  "tech-dev":      path.join(PUBLIC_BASE, "Tech-EN/Dev"),
  "tech-work":     path.join(PUBLIC_BASE, "Tech-EN/Work"),
  "tech-it":       path.join(PUBLIC_BASE, "Tech-EN/IT"),
} as const;

export const ATTACHMENTS_SOURCE = "040.Archive/044.Attachments";

export const CONTENT_DEST = {
  posts: "src/data/posts",
  images: "public/images",
} as const;

export const PUBLIC_IMAGE_URL = "/images";

export type PostCategory = keyof typeof POST_SOURCES;
export type EnPostCategory = keyof typeof EN_POST_SOURCES;
