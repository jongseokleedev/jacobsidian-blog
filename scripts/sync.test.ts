import { describe, it, expect } from "vitest";
import { extractWikilinks } from "./lib/transform";

describe("extractWikilinks", () => {
  it("extracts simple wikilinks", () => {
    expect(extractWikilinks("see [[note-a]] and [[note-b]]")).toEqual(["note-a", "note-b"]);
  });

  it("extracts alias wikilinks (target only)", () => {
    expect(extractWikilinks("see [[note-a|alias]]")).toEqual(["note-a"]);
  });

  it("extracts section wikilinks (file only)", () => {
    expect(extractWikilinks("see [[note-a#section]]")).toEqual(["note-a"]);
  });

  it("ignores image embeds ![[img.png]]", () => {
    expect(extractWikilinks("![[image.png]]")).toEqual([]);
  });

  it("returns empty for no wikilinks", () => {
    expect(extractWikilinks("plain text")).toEqual([]);
  });
});
