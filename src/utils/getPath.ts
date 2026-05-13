import type { CollectionEntry } from "astro:content";
import { slugifyStr } from "./slugify";

const CATEGORY_TO_SEGMENT = {
  thought: "thoughts",
  writing: "writing",
  tech: "tech",
} as const;

type Entry = CollectionEntry<"posts"> | CollectionEntry<"books">;

export function getPath(entry: Entry): string {
  // Use the basename of the id (drop any leading subdir segments).
  const basename = entry.id.split("/").pop() ?? entry.id;
  const slug = slugifyStr(basename);

  if ("category" in entry.data) {
    return `/${CATEGORY_TO_SEGMENT[entry.data.category]}/${slug}/`;
  }
  return `/books/${slug}/`;
}
