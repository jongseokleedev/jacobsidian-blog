import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

export const POST: APIRoute = async ({ request }) => {
  const { commentId, password } = await request.json().catch(() => ({}));

  if (!commentId || !password) {
    return new Response(JSON.stringify({ error: "missing fields" }), { status: 400 });
  }

  if (password !== import.meta.env.ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }

  const sb = createClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  const { error } = await sb.from("comments").delete().eq("id", commentId);
  if (error) {
    return new Response(JSON.stringify({ error: "db error" }), { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
