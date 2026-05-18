const MARKDOWN_IMAGE_RE = /!\[.*?\]\((https?:\/\/[^)]+)\)/;

/**
 * Extracts a display image URL from a post entry.
 * Priority: ogImage field → first remote image in body markdown
 */
export function getPostImage(
  ogImage: string | { src: string } | undefined,
  body: string | undefined
): string | null {
  if (ogImage) {
    return typeof ogImage === "string" ? ogImage : ogImage.src;
  }
  if (body) {
    const m = body.match(MARKDOWN_IMAGE_RE);
    if (m) return m[1];
  }
  return null;
}
