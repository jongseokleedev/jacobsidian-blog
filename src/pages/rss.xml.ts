import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { getPath } from "@/utils/getPath";
import getSortedPosts from "@/utils/getSortedPosts";
import { SITE } from "@/config";

export async function GET() {
  const posts = await getCollection("posts");
  const sortedPosts = getSortedPosts(posts);
  return rss({
    title: SITE.title,
    description: SITE.desc,
    site: SITE.website,
    items: sortedPosts.map(entry => ({
      link: getPath(entry),
      title: entry.data.title,
      description: entry.data.description,
      pubDate: new Date(entry.data.modDatetime ?? entry.data.pubDatetime),
    })),
  });
}
