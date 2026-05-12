import { describe, expect, it } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { discoverBooks, discoverPosts } from "./discover";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_VAULT = path.resolve(__dirname, "../__fixtures__/vault");

describe("discoverPosts", () => {
  it("returns only published posts grouped by category", async () => {
    const posts = await discoverPosts(FIXTURE_VAULT, {
      thought: "posts/thought",
      writing: "posts/writing",
      it: "posts/it",
    });

    const titles = posts.map(p => p.frontmatter.title).sort();
    expect(titles).toEqual(["발행된 IT 글", "생각 글"]);
  });

  it("attaches category and absolute file path", async () => {
    const posts = await discoverPosts(FIXTURE_VAULT, {
      thought: "posts/thought",
      it: "posts/it",
    });

    const it = posts.find(p => p.frontmatter.title === "발행된 IT 글");
    expect(it?.category).toBe("it");
    expect(it?.absolutePath).toContain("published-post.md");

    const thought = posts.find(p => p.frontmatter.title === "생각 글");
    expect(thought?.category).toBe("thought");
  });

  it("excludes posts without status: published", async () => {
    const posts = await discoverPosts(FIXTURE_VAULT, {
      it: "posts/it",
    });
    expect(posts.map(p => p.frontmatter.title)).not.toContain("초안 IT 글");
  });

  it("skips sources that don't exist", async () => {
    const posts = await discoverPosts(FIXTURE_VAULT, {
      it: "posts/it",
      writing: "posts/does-not-exist",
    });
    expect(posts).toHaveLength(1);
  });
});

describe("discoverBooks", () => {
  it("returns only books with published: true", async () => {
    const books = await discoverBooks(FIXTURE_VAULT, "books");
    const titles = books.map(b => b.frontmatter.title);
    expect(titles).toEqual(["존재와 시간"]);
  });

  it("attaches absolute file path", async () => {
    const books = await discoverBooks(FIXTURE_VAULT, "books");
    expect(books[0]?.absolutePath).toContain("존재와시간.md");
  });

  it("returns empty array when source folder missing", async () => {
    const books = await discoverBooks(FIXTURE_VAULT, "does-not-exist");
    expect(books).toEqual([]);
  });
});
