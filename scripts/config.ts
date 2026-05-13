import path from "node:path";
import os from "node:os";

export const VAULT_PATH = path.join(
  os.homedir(),
  "Library/Mobile Documents/iCloud~md~obsidian/Documents/jacobsidian"
);

const PUBLIC_BASE = "020.Area/022.Writing/022-1.Public";

export const POST_SOURCES = {
  thought: path.join(PUBLIC_BASE, "022-1-1.생각"),
  writing: path.join(PUBLIC_BASE, "022-1-2.글쓰기"),
  tech: path.join(PUBLIC_BASE, "022-1-3.IT"),
} as const;

export const BOOKS_SOURCE = path.join(PUBLIC_BASE, "022-1-4.책");

export const ATTACHMENTS_SOURCE = "040.Archive/044.Attachments";

export const CONTENT_DEST = {
  posts: "src/data/posts",
  books: "src/data/books",
  images: "public/images",
} as const;

export const PUBLIC_IMAGE_URL = "/images";

export type PostCategory = keyof typeof POST_SOURCES;
