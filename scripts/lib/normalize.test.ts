import { describe, expect, it } from "vitest";
import {
  normalizePostFrontmatter,
  pickSlug,
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

  it("strips punctuation", () => {
    expect(slugify("AI 시대, 우리는?")).toBe("ai-시대-우리는");
    expect(slugify("Hello, World!")).toBe("hello-world");
  });
});

describe("pickSlug", () => {
  it("derives slug from frontmatter title", () => {
    expect(pickSlug({}, "/v/Untitled.md", "AI 시대의 협업")).toBe(
      "ai-시대의-협업"
    );
  });

  it("falls back to filename when title is 'Untitled'", () => {
    expect(pickSlug({}, "/v/my-post.md", "Untitled")).toBe("my-post");
  });

  it("falls back to filename when title is empty", () => {
    expect(pickSlug({}, "/v/fallback.md", "")).toBe("fallback");
  });

  it("respects explicit slug override", () => {
    expect(pickSlug({ slug: "Custom Slug" }, "/v/x.md", "Title")).toBe(
      "custom-slug"
    );
  });

  it("ignores blank slug override", () => {
    expect(pickSlug({ slug: "  " }, "/v/x.md", "Title")).toBe("title");
  });
});

describe("normalizePostFrontmatter", () => {
  it("maps published_at → pubDatetime ISO string (bare date → KST midnight)", () => {
    const out = normalizePostFrontmatter(
      {
        title: "T",
        status: "published",
        published_at: "2026-05-10",
        created: "2026-05-01",
      },
      "tech-it",
      "test-slug"
    );
    expect(out.pubDatetime).toBe("2026-05-09T15:00:00.000Z");
  });

  it("falls back to created when published_at missing", () => {
    const out = normalizePostFrontmatter(
      { title: "T", status: "published", created: "2026-05-05" },
      "essay-thought",
      "test-slug"
    );
    expect(out.pubDatetime).toBe("2026-05-04T15:00:00.000Z");
  });

  it("includes category, slug, and required fields", () => {
    const out = normalizePostFrontmatter(
      {
        title: "Hello",
        status: "published",
        published_at: "2026-05-10",
        description: "desc",
        tags: ["x", "y"],
      },
      "tech-it",
      "hello-slug"
    );
    expect(out.title).toBe("Hello");
    expect(out.slug).toBe("hello-slug");
    expect(out.category).toBe("tech-it");
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
      "tech-it",
      "test-slug"
    );
    expect(out).not.toHaveProperty("status");
    expect(out).not.toHaveProperty("published_at");
    expect(out).not.toHaveProperty("created");
  });

  it("provides default description when missing", () => {
    const out = normalizePostFrontmatter(
      { title: "T", status: "published", published_at: "2026-05-10" },
      "tech-it",
      "test-slug"
    );
    expect(typeof out.description).toBe("string");
  });
});

