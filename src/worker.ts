export default {
  async fetch(request: Request, env: { ASSETS: { fetch: (r: Request) => Promise<Response> } }): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/books/")) {
      const slug = url.pathname.replace("/books/", "").replace(/\/$/, "");
      return Response.redirect(`${url.origin}/review/book/${slug}/`, 301);
    }

    return env.ASSETS.fetch(request);
  },
};
