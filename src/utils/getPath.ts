import type { CollectionEntry } from "astro:content";
import { slugifyStr } from "./slugify";
import { parseCategory } from "./getCategories";

type Entry = CollectionEntry<"posts">;

export function getPath(entry: Entry): string {
  const basename = entry.id.split("/").pop() ?? entry.id;
  const slug = slugifyStr(basename);
  const { parent, sub } = parseCategory(entry.data.category);
  return `/${parent}/${sub}/${slug}/`;
}
