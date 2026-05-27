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

      const koPosts = await getCollection(
        "posts",
        ({ data }) => data.category === catKey && !data.draft && data.lang !== "en"
      );
      const enPosts = await getCollection(
        "posts",
        ({ data }) => data.category === catKey && !data.draft && data.lang === "en"
      );
      const enBySlug = new Map(
        enPosts.map(p => [
          slugifyStr((p.id.split("/").pop() ?? p.id).replace(/\.en$/, "")),
          p,
        ])
      );

      for (const koPost of koPosts) {
        const slug = slugifyStr(koPost.id.split("/").pop() ?? koPost.id);
        const enPost = enBySlug.get(slug);
        allPaths.push({
          params: { parent, sub, slug },
          // Use English post for OG if available, otherwise Korean fallback
          props: { post: enPost ?? koPost },
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
