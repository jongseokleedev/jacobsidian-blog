export interface LinkEntry {
  basename: string;
  slug: string;
  title: string;
  url: string;
}

export type LinkMap = Map<string, LinkEntry>;

export function buildLinkMap(
  posts: LinkEntry[],
  books: LinkEntry[]
): LinkMap {
  const map: LinkMap = new Map();
  for (const entry of [...posts, ...books]) {
    map.set(entry.basename, entry);
    map.set(entry.title, entry);
    map.set(entry.slug, entry);
  }
  return map;
}
