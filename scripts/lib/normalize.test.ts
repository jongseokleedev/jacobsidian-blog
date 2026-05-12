import { describe, expect, it } from "vitest";
import {
  normalizeBookFrontmatter,
  normalizePostFrontmatter,
  slugify,
} from "./normalize";

describe("slugify", () => {
  it("lowercases and replaces spaces with dashes", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("preserves Korean characters", () => {
    expect(slugify("생각 글")).toBe("생각-글");
  });

  it("strips file extensions", () => {
    expect(slugify("note.md")).toBe("note");
  });

  it("collapses repeated separators", () => {
    expect(slugify("a   b---c")).toBe("a-b-c");
  });

  it("trims leading/trailing separators", () => {
    expect(slugify("--hello--")).toBe("hello");
  });
});

describe("normalizePostFrontmatter", () => {
  it("maps published_at → pubDatetime ISO string", () => {
    const out = normalizePostFrontmatter(
      {
        title: "T",
        status: "published",
        published_at: "2026-05-10",
        created: "2026-05-01",
      },
      "it"
    );
    expect(out.pubDatetime).toBe("2026-05-10T00:00:00.000Z");
  });

  it("falls back to created when published_at missing", () => {
    const out = normalizePostFrontmatter(
      { title: "T", status: "published", created: "2026-05-05" },
      "thought"
    );
    expect(out.pubDatetime).toBe("2026-05-05T00:00:00.000Z");
  });

  it("includes category and required fields", () => {
    const out = normalizePostFrontmatter(
      {
        title: "Hello",
        status: "published",
        published_at: "2026-05-10",
        description: "desc",
        tags: ["x", "y"],
      },
      "it"
    );
    expect(out.title).toBe("Hello");
    expect(out.category).toBe("it");
    expect(out.description).toBe("desc");
    expect(out.tags).toEqual(["x", "y"]);
  });

  it("drops vault-only fields (status, published_at, created)", () => {
    const out = normalizePostFrontmatter(
      {
        title: "T",
        status: "published",
        published_at: "2026-05-10",
        created: "2026-05-01",
      },
      "it"
    );
    expect(out).not.toHaveProperty("status");
    expect(out).not.toHaveProperty("published_at");
    expect(out).not.toHaveProperty("created");
  });

  it("provides default description when missing", () => {
    const out = normalizePostFrontmatter(
      { title: "T", status: "published", published_at: "2026-05-10" },
      "it"
    );
    expect(typeof out.description).toBe("string");
  });
});

describe("normalizeBookFrontmatter", () => {
  it("maps published_at → pubDatetime", () => {
    const out = normalizeBookFrontmatter({
      title: "존재와 시간",
      author: "하이데거",
      published: true,
      published_at: "2026-05-09",
    });
    expect(out.pubDatetime).toBe("2026-05-09T00:00:00.000Z");
  });

  it("drops the published flag", () => {
    const out = normalizeBookFrontmatter({
      title: "T",
      author: "A",
      published: true,
      published_at: "2026-05-09",
    });
    expect(out).not.toHaveProperty("published");
  });

  it("preserves author and description", () => {
    const out = normalizeBookFrontmatter({
      title: "T",
      author: "A",
      published: true,
      published_at: "2026-05-09",
      description: "리뷰",
    });
    expect(out.author).toBe("A");
    expect(out.description).toBe("리뷰");
  });
});
