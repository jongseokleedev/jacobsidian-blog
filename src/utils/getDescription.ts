import type { CollectionEntry } from "astro:content";

const PUNCT_TRIM = /[\s"'`*_~>#-]+$/;

/**
 * Extract the first meaningful paragraph from markdown body.
 * Strips frontmatter, code blocks, headings, images, html, wikilinks, footnotes.
 */
function extractFirstParagraph(body: string, max: number): string {
  if (!body) return "";

  const cleaned = body
    .replace(/^---[\s\S]*?\n---\n/, "")        // leftover frontmatter
    .replace(/```[\s\S]*?```/g, "")            // fenced code blocks
    .replace(/^#{1,6}\s.*$/gm, "")             // headings
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")      // images
    .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, a: string, b?: string) => b || a) // wikilinks → text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")   // markdown links → text
    .replace(/\[\^[^\]]+\]/g, "")              // footnote refs [^1]
    .replace(/<[^>]+>/g, "")                   // raw html
    .replace(/`([^`]+)`/g, "$1")               // inline code
    .replace(/\*\*([^*]+)\*\*/g, "$1")         // bold
    .replace(/\*([^*]+)\*/g, "$1")             // italic *...*
    .replace(/(^|\s)_([^_]+)_/g, "$1$2")       // italic _..._
    .replace(/^\s*>\s?/gm, "")                 // blockquote
    .replace(/^\s*[-*+]\s+/gm, "")             // list bullets
    .replace(/^\s*\d+\.\s+/gm, "");            // ordered list markers

  const paragraphs = cleaned.split(/\n\s*\n/);
  const first = paragraphs
    .map(p => p.replace(/\s+/g, " ").trim())
    .find(p => p.length >= 20) ?? "";

  if (!first) return "";

  if (first.length <= max) return first;
  return first.slice(0, max - 1).replace(PUNCT_TRIM, "") + "…";
}

/**
 * Returns the post's explicit description if present, otherwise auto-derives
 * a description from the first paragraph of the body.
 */
export function getDescription(
  post: CollectionEntry<"posts">,
  max = 160
): string {
  const explicit = post.data.description?.trim();
  if (explicit) return explicit;
  return extractFirstParagraph(post.body ?? "", max);
}
