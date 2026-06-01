import { getCollection } from "astro:content";

let cache: Map<string, string> | null = null;

export async function getSeriesSlug(seriesName: string): Promise<string> {
  if (!cache) {
    const all = await getCollection("series");
    cache = new Map(all.map(s => [s.data.title, s.id]));
  }
  return cache.get(seriesName) ?? seriesName.replace(/\s+/g, "-").toLowerCase();
}
