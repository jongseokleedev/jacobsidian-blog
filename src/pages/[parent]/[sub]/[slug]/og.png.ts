import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { slugifyStr } from "@/utils/slugify";
import { PARENTS } from "@/utils/getCategories";
import { generateOgImageForPost } from "@/utils/generateOgImages";

export async function getStaticPaths() {
  const allPaths = [];
  for (const [parent, pm] of Object.entries(PARENTS)) {
    for (const sub of Object.keys(pm.subs)) {
      const catKey = `${parent}-${sub}`;
      const posts = await getCollection(
        "posts",
        ({ data }) =>
          data.category === catKey && !data.draft && data.lang !== "en"
      );
      for (const post of posts) {
        allPaths.push({
          params: {
            parent,
            sub,
            slug: slugifyStr(post.id.split("/").pop() ?? post.id),
          },
          props: { post },
        });
      }
    }
  }
  return allPaths;
}

export const GET: APIRoute = async ({ props }) => {
  const buffer = await generateOgImageForPost(props.post);
  return new Response(new Uint8Array(buffer), {
    headers: { "Content-Type": "image/png" },
  });
};
