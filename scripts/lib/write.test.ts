import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { cleanOrphans, writeContent } from "./write";

async function makeTmpDir() {
  return await fs.mkdtemp(path.join(os.tmpdir(), "jacobsidian-write-"));
}

describe("writeContent", () => {
  let dest: string;

  beforeEach(async () => {
    dest = await makeTmpDir();
  });

  afterEach(async () => {
    await fs.rm(dest, { recursive: true, force: true });
  });

  it("writes a markdown file with frontmatter and body", async () => {
    await writeContent({
      destDir: dest,
      slug: "hello",
      frontmatter: { title: "Hello", pubDatetime: "2026-05-10T00:00:00.000Z" },
      body: "본문입니다.\n",
    });

    const written = await fs.readFile(path.join(dest, "hello.md"), "utf8");
    expect(written).toContain("title: Hello");
    expect(written).toMatch(/pubDatetime: ['"]?2026-05-10T00:00:00\.000Z['"]?/);
    expect(written).toContain("본문입니다.");
  });

  it("creates the destination directory if missing", async () => {
    const nested = path.join(dest, "deep/nested");
    await writeContent({
      destDir: nested,
      slug: "x",
      frontmatter: { title: "X" },
      body: "",
    });
    const stat = await fs.stat(path.join(nested, "x.md"));
    expect(stat.isFile()).toBe(true);
  });

  it("respects dryRun (writes nothing)", async () => {
    await writeContent({
      destDir: dest,
      slug: "dry",
      frontmatter: { title: "Dry" },
      body: "",
      dryRun: true,
    });
    const entries = await fs.readdir(dest);
    expect(entries).toEqual([]);
  });
});

describe("cleanOrphans", () => {
  let dest: string;

  beforeEach(async () => {
    dest = await makeTmpDir();
  });

  afterEach(async () => {
    await fs.rm(dest, { recursive: true, force: true });
  });

  it("removes files whose slugs are not in the keep set", async () => {
    await fs.writeFile(path.join(dest, "keep.md"), "ok");
    await fs.writeFile(path.join(dest, "orphan.md"), "old");

    const removed = await cleanOrphans({
      destDir: dest,
      keepSlugs: new Set(["keep"]),
    });

    expect(removed).toEqual(["orphan.md"]);
    const remaining = await fs.readdir(dest);
    expect(remaining).toEqual(["keep.md"]);
  });

  it("ignores non-markdown files", async () => {
    await fs.writeFile(path.join(dest, "keep.md"), "ok");
    await fs.writeFile(path.join(dest, "notes.txt"), "leave");

    await cleanOrphans({ destDir: dest, keepSlugs: new Set(["keep"]) });
    const entries = await fs.readdir(dest);
    expect(entries.sort()).toEqual(["keep.md", "notes.txt"]);
  });

  it("respects dryRun (returns list but removes nothing)", async () => {
    await fs.writeFile(path.join(dest, "orphan.md"), "old");
    const removed = await cleanOrphans({
      destDir: dest,
      keepSlugs: new Set(),
      dryRun: true,
    });
    expect(removed).toEqual(["orphan.md"]);
    const entries = await fs.readdir(dest);
    expect(entries).toEqual(["orphan.md"]);
  });

  it("never removes .en.md files (English translations managed separately)", async () => {
    await fs.writeFile(path.join(dest, "keep.md"), "ok");
    await fs.writeFile(path.join(dest, "keep.en.md"), "english");
    await fs.writeFile(path.join(dest, "orphan.md"), "old");

    const removed = await cleanOrphans({
      destDir: dest,
      keepSlugs: new Set(["keep"]),
    });

    expect(removed).toEqual(["orphan.md"]);
    const remaining = (await fs.readdir(dest)).sort();
    expect(remaining).toEqual(["keep.en.md", "keep.md"]);
  });

  it("handles missing destDir gracefully", async () => {
    const removed = await cleanOrphans({
      destDir: path.join(dest, "does-not-exist"),
      keepSlugs: new Set(),
    });
    expect(removed).toEqual([]);
  });
});
