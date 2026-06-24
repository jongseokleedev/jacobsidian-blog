import path from "node:path";
import type { PostCategory } from "../config";

export function stripControlChars(s: string): string {
  return s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, "");
}

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
  // YAML parses bare dates (YYYY-MM-DD) as Date at UTC midnight. Treat those as KST midnight
  // so scheduled posts surface from KST 00:00, not KST 09:00.
  if (value instanceof Date) {
    const iso = value.toISOString();
    if (iso.endsWith("T00:00:00.000Z")) {
      return new Date(`${iso.slice(0, 10)}T00:00:00+09:00`).toISOString();
    }
    return iso;
  }
  const s = String(value).trim();
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
  poster?: string;
  tags?: string[];
  featured?: boolean;
  draft?: boolean;
  links?: string[];
  series?: string;
  seriesOrder?: number;
  rating?: number;
  tagline?: string;
}

export function normalizePostFrontmatter(
  fm: Record<string, unknown>,
  category: PostCategory,
  slug: string
): NormalizedPost {
  const out: NormalizedPost = {
    title: stripControlChars(String(fm.title ?? "Untitled")),
    slug,
    category,
    pubDatetime: pickPubDatetime(fm),
    description: stripControlChars(String(fm.description ?? "")),
  };

  const mod = toIsoDate(fm.modified ?? fm.updated);
  if (mod) out.modDatetime = mod;

  if (typeof fm.poster === "string" && fm.poster.trim()) out.poster = fm.poster.trim();

  if (Array.isArray(fm.tags)) {
    out.tags = (fm.tags as unknown[]).map(t => String(t));
  }
  if (typeof fm.featured === "boolean") out.featured = fm.featured;
  if (typeof fm.draft === "boolean") out.draft = fm.draft;
  if (Array.isArray(fm.links) && (fm.links as unknown[]).length > 0) {
    out.links = (fm.links as unknown[]).map(l => String(l));
  }

  if (typeof fm.series === "string" && fm.series.trim()) out.series = fm.series.trim();
  if (typeof fm.series_order === "number") out.seriesOrder = fm.series_order;

  if (typeof fm.rating === "number" && fm.rating >= 0 && fm.rating <= 5) {
    out.rating = Math.round(fm.rating * 2) / 2;
  }
  if (typeof fm.tagline === "string" && fm.tagline.trim()) {
    out.tagline = stripControlChars(fm.tagline.trim());
  }

  return out;
}

