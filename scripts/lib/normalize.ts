import type { PostCategory } from "../config";

export function slugify(input: string): string {
  return input
    .replace(/\.md$/i, "")
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toIsoDate(value: unknown): string | undefined {
  if (value == null) return undefined;
  if (value instanceof Date) return value.toISOString();
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

function pickPubDatetime(fm: Record<string, unknown>): string {
  const pub = toIsoDate(fm.published_at) ?? toIsoDate(fm.created);
  if (!pub) {
    throw new Error(
      `Missing published_at and created in frontmatter: ${JSON.stringify(fm.title ?? fm)}`
    );
  }
  return pub;
}

export interface NormalizedPost {
  title: string;
  category: PostCategory;
  pubDatetime: string;
  modDatetime?: string;
  description: string;
  tags?: string[];
  featured?: boolean;
  draft?: boolean;
}

export function normalizePostFrontmatter(
  fm: Record<string, unknown>,
  category: PostCategory
): NormalizedPost {
  const out: NormalizedPost = {
    title: String(fm.title ?? "Untitled"),
    category,
    pubDatetime: pickPubDatetime(fm),
    description: String(fm.description ?? ""),
  };

  const mod = toIsoDate(fm.modified ?? fm.updated);
  if (mod) out.modDatetime = mod;

  if (Array.isArray(fm.tags)) {
    out.tags = (fm.tags as unknown[]).map(t => String(t));
  }
  if (typeof fm.featured === "boolean") out.featured = fm.featured;
  if (typeof fm.draft === "boolean") out.draft = fm.draft;

  return out;
}

export interface NormalizedBook {
  title: string;
  author: string;
  pubDatetime: string;
  modDatetime?: string;
  description: string;
  tags?: string[];
  draft?: boolean;
}

export function normalizeBookFrontmatter(
  fm: Record<string, unknown>
): NormalizedBook {
  const out: NormalizedBook = {
    title: String(fm.title ?? "Untitled"),
    author: String(fm.author ?? ""),
    pubDatetime: pickPubDatetime(fm),
    description: String(fm.description ?? ""),
  };

  const mod = toIsoDate(fm.modified ?? fm.updated);
  if (mod) out.modDatetime = mod;

  if (Array.isArray(fm.tags)) {
    out.tags = (fm.tags as unknown[]).map(t => String(t));
  }
  if (typeof fm.draft === "boolean") out.draft = fm.draft;

  return out;
}
