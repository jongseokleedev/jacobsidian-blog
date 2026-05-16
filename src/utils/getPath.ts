import type { CollectionEntry } from "astro:content";
import { slugifyStr } from "./slugify";

const CATEGORY_TO_SEGMENT = {
  thought: "thoughts",
  writing: "writing",
  tech: "tech",
  book: "books",
} as const;

type Entry = CollectionEntry<"posts">;

export function getPath(entry: Entry): string {
  // Use the basename of the id (drop any leading subdir segments).
  const basename = entry.id.split("/").pop() ?? entry.id;
  const slug = slugifyStr(basename);

  return `/${CATEGORY_TO_SEGMENT[entry.data.category]}/${slug}/`;
}
