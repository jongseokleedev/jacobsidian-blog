import rss from "@astrojs/rss";
import { getCollection, type CollectionEntry } from "astro:content";
import { getPath } from "@/utils/getPath";
import { SITE } from "@/config";

type FeedEntry = CollectionEntry<"posts"> | CollectionEntry<"books">;

const isPublishable = ({ data }: FeedEntry) => {
  const isPublishTimePassed =
    Date.now() >
    new Date(data.pubDatetime).getTime() - SITE.scheduledPostMargin;
  return !data.draft && (import.meta.env.DEV || isPublishTimePassed);
};

const sortKey = (entry: FeedEntry) =>
  new Date(entry.data.modDatetime ?? entry.data.pubDatetime).getTime();

export async function GET() {
  const [posts, books] = await Promise.all([
    getCollection("posts"),
    getCollection("books"),
  ]);
  const entries = [...posts, ...books]
    .filter(isPublishable)
    .sort((a, b) => sortKey(b) - sortKey(a));

  return rss({
    title: SITE.title,
    description: SITE.desc,
    site: SITE.website,
    items: entries.map(entry => ({
      link: getPath(entry),
      title: entry.data.title,
      description: entry.data.description,
      pubDate: new Date(entry.data.modDatetime ?? entry.data.pubDatetime),
    })),
  });
}
