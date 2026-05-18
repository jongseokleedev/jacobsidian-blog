import { describe, it, expect } from "vitest";
import { getPath } from "./getPath";
import type { CollectionEntry } from "astro:content";

function makePost(id: string, category: string): CollectionEntry<"posts"> {
  return {
    id,
    collection: "posts",
    data: { category, title: id, pubDatetime: new Date(), description: "" },
  } as unknown as CollectionEntry<"posts">;
}

describe("getPath", () => {
  it("builds path from category and slug", () => {
    expect(getPath(makePost("my-post", "tech-dev"))).toBe("/tech/dev/my-post/");
  });

  it("slugifies Latin filenames", () => {
    expect(getPath(makePost("Hello World", "essay-thought"))).toBe(
      "/essay/thought/hello-world/"
    );
  });

  it("handles nested directory ids by using basename", () => {
    expect(getPath(makePost("subdir/my-note", "review-book"))).toBe(
      "/review/book/my-note/"
    );
  });
});
