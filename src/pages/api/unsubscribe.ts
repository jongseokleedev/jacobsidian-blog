import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

export const GET: APIRoute = async ({ url }) => {
  const token = url.searchParams.get("token");

  if (!token) {
    return new Response("token이 필요합니다.", { status: 400 });
  }

  const supabase = createClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  const { error } = await supabase
    .from("subscribers")
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq("token", token)
    .is("unsubscribed_at", null);

  if (error) {
    return new Response("오류가 발생했습니다.", { status: 500 });
  }

  return new Response("구독이 취소되었습니다.", { status: 200 });
};
