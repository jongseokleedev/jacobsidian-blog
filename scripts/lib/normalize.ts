import path from "node:path";
import type { PostCategory } from "../config";

export function slugify(input: string): string {
  return input
    .replace(/\.md$/i, "")
    .toLowerCase()
    .trim()
    .replace(/[,.!?;:'"`()\[\]{}<>/\\|*&^%$#@~]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function pickSlug(
  vaultFrontmatter: Record<string, unknown>,
  absolutePath: string,
  title: string
): string {
  const explicit = vaultFrontmatter.slug;
  if (typeof explicit === "string" && explicit.trim()) return slugify(explicit);

  const fromTitle = slugify(title);
  const fromFile = slugify(path.basename(absolutePath, ".md"));

  if (fromTitle && fromTitle !== "untitled") return fromTitle;
  return fromFile;
}

function toIsoDate(value: unknown): string | undefined {
  if (value == null) return undefined;
  if (value instanceof Date) return value.toISOString();
  const s = String(value).trim();
  // Bare date (YYYY-MM-DD) → interpret as KST midnight (UTC-9h = UTC+9 → T15:00:00Z prev day)
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const date = new Date(`${s}T00:00:00+09:00`);
    if (Number.isNaN(date.getTime())) return undefined;
    return date.toISOString();
  }
  const date = new Date(s);
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
  slug: string;
  category: PostCategory;
  pubDatetime: string;
  modDatetime?: string;
  description: string;
  tags?: string[];
  featured?: boolean;
  draft?: boolean;
  links?: string[];
}

export function normalizePostFrontmatter(
  fm: Record<string, unknown>,
  category: PostCategory,
  slug: string
): NormalizedPost {
  const out: NormalizedPost = {
    title: String(fm.title ?? "Untitled"),
    slug,
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
  if (Array.isArray(fm.links) && (fm.links as unknown[]).length > 0) {
    out.links = (fm.links as unknown[]).map(l => String(l));
  }

  return out;
}

